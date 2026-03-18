import { useState, useEffect, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';
import concurrencyLimit from '../utils/concurrencyLimit';

/**
 * Fetches GW live stats (all players' scores for a given gameweek) from
 * /api/gw-live-stats/:gwId — one request per GW instead of one per player.
 *
 * Uses a dual-layer cache:
 *   L1 = useRef (in-memory, fastest, lost on refresh)
 *   L2 = localStorage via cache utility (survives refresh/tab close)
 *
 * @param {number[]} gwIds - Gameweek IDs to fetch
 * @param {number|null} currentGWId - The current/live GW ID (gets short TTL; others never expire)
 * @returns {{ gwLiveStats: object, error: string|null }}
 */
export default function useGWLiveStats(gwIds, currentGWId) {
  const [gwLiveStats, setGwLiveStats] = useState({});
  const [error, setError] = useState(null);
  const cache = useRef({});
  const inflight = useRef(new Set());

  // Use a stable string key so the effect only re-runs when IDs actually change.
  const gwIdsKey = [...gwIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!gwIds || gwIds.length === 0) return;

    let stale = false;

    const fetchAll = async () => {
      // Hydrate L1 from L2 (localStorage) for any IDs not already in memory
      for (const id of gwIds) {
        if (!cache.current[id]) {
          const stored = cacheGet(`gwLiveStats_${id}`);
          if (stored) cache.current[id] = stored;
        }
      }

      // Filter out cached and in-flight IDs
      const uncached = gwIds.filter((id) => !cache.current[id] && !inflight.current.has(id));

      if (uncached.length === 0) {
        if (!stale) {
          const result = {};
          for (const id of gwIds) {
            if (cache.current[id]) result[id] = cache.current[id];
          }
          setGwLiveStats(result);
        }
        return;
      }

      // Mark as in-flight
      uncached.forEach((id) => inflight.current.add(id));

      const tasks = uncached.map((gwId) => async () => {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/gw-live-stats/${gwId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cache.current[gwId] = data;
        inflight.current.delete(gwId);
        const ttl = gwId === currentGWId ? TTL.GW_LIVE_CURRENT : TTL.GW_LIVE_FINISHED;
        cacheSet(`gwLiveStats_${gwId}`, data, ttl);
      });

      const results = await concurrencyLimit(tasks, 3);

      // Clear inflight for any that failed
      uncached.forEach((id) => inflight.current.delete(id));

      if (stale) return;

      if (results.some((r) => r.status === 'rejected')) {
        const failed = results.filter((r) => r.status === 'rejected');
        failed.forEach((r) => console.error('Failed to fetch GW live stats:', r.reason));
        setError('Failed to load some live stats');
      }

      // Build result from ALL cached data, not just this batch's gwIds
      const result = {};
      for (const id of gwIds) {
        if (cache.current[id]) result[id] = cache.current[id];
      }
      setGwLiveStats(result);
    };

    fetchAll();

    return () => { stale = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gwIdsKey]);

  return { gwLiveStats, error };
}
