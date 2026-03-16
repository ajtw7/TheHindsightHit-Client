import { useState, useEffect, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

/**
 * Fetches historical player prices per gameweek from /api/prices/:gwId.
 * Response is a flat object keyed by element ID: { "1": 55, "2": 45, ... }
 * where values are prices in 1/10th GBP (55 = £5.5m).
 *
 * Uses a dual-layer cache:
 *   L1 = useRef (in-memory, fastest, lost on refresh)
 *   L2 = localStorage via cache utility (survives refresh/tab close)
 *
 * @param {number[]} gwIds - Gameweek IDs to fetch prices for
 * @returns {{ historicalPrices: object, error: string|null }}
 */
export default function useHistoricalPrices(gwIds) {
  const [historicalPrices, setHistoricalPrices] = useState({});
  const [error, setError] = useState(null);
  const cache = useRef({});

  const gwIdsKey = [...gwIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!gwIds || gwIds.length === 0) return;

    const fetchAll = async () => {
      // Hydrate L1 from L2 (localStorage) for any IDs not already in memory
      for (const id of gwIds) {
        if (!cache.current[id]) {
          const stored = cacheGet(`prices_${id}`);
          if (stored) cache.current[id] = stored;
        }
      }

      const uncached = gwIds.filter((id) => !cache.current[id]);

      if (uncached.length === 0) {
        const result = {};
        for (const id of gwIds) {
          if (cache.current[id]) result[id] = cache.current[id];
        }
        setHistoricalPrices(result);
        return;
      }

      let hadError = false;

      await Promise.all(
        uncached.map(async (gwId) => {
          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/api/prices/${gwId}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            cache.current[gwId] = data;
            cacheSet(`prices_${gwId}`, data, TTL.PRICES);
          } catch (err) {
            console.error(`Failed to fetch GW ${gwId} prices:`, err);
            hadError = true;
          }
        })
      );

      if (hadError) {
        setError('Failed to load some price data');
      }

      const result = {};
      for (const id of gwIds) {
        if (cache.current[id]) result[id] = cache.current[id];
      }
      setHistoricalPrices(result);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gwIdsKey]);

  return { historicalPrices, error };
}
