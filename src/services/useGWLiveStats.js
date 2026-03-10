import { useState, useEffect, useRef } from 'react';

/**
 * Fetches GW live stats (all players' scores for a given gameweek) from
 * /api/gw-live-stats/:gwId — one request per GW instead of one per player.
 *
 * @param {number[]} gwIds - Gameweek IDs to fetch
 * @returns {{ [gwId: number]: { elements: Array<{ id, stats: { total_points, minutes, goals_scored, ... } }> } }}
 */
export default function useGWLiveStats(gwIds) {
  const [gwLiveStats, setGwLiveStats] = useState({});
  const cache = useRef({});

  // Use a stable string key so the effect only re-runs when IDs actually change.
  const gwIdsKey = [...gwIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!gwIds || gwIds.length === 0) return;

    const fetchAll = async () => {
      const uncached = gwIds.filter((id) => !cache.current[id]);

      await Promise.all(
        uncached.map(async (gwId) => {
          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/api/gw-live-stats/${gwId}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            cache.current[gwId] = data;
          } catch (err) {
            console.error(`Failed to fetch GW ${gwId} live stats:`, err);
          }
        })
      );

      const result = {};
      for (const id of gwIds) {
        if (cache.current[id]) result[id] = cache.current[id];
      }
      setGwLiveStats(result);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gwIdsKey]);

  return gwLiveStats;
}
