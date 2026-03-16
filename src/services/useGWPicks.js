import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

/**
 * Fetches the manager's squad picks for a specific gameweek.
 * Reuses the same backend endpoint as useGWPlayerStats but is designed
 * for on-demand use in GWHistory as the user selects different GWs.
 *
 * Returns an array of player element IDs that were in the squad that GW.
 */
export default function useGWPicks(gwId, mgrId) {
  const [picks, setPicks] = useState(() => {
    if (!gwId || !mgrId) return [];
    return cacheGet(`gwPicks_${mgrId}_${gwId}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gwId || !mgrId) return;

    const key = `gwPicks_${mgrId}_${gwId}`;
    const cached = cacheGet(key);
    if (cached) {
      setPicks(cached);
      return;
    }

    const fetchPicks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/${mgrId}/gw-player-stats/${gwId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setPicks(data);
        cacheSet(key, data, TTL.GW_STATS);
      } catch (err) {
        console.error('Error fetching GW picks', err);
        setError(err.message || 'Failed to fetch squad picks');
      } finally {
        setLoading(false);
      }
    };
    fetchPicks();
  }, [gwId, mgrId]);

  return { picks, loading, error };
}
