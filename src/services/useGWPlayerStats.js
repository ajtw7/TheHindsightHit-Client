import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useGWPlayerStats(selectedGW, mgrId) {
  const [gwPlayerStats, setGWPlayerStats] = useState(() => {
    if (!selectedGW || !mgrId) return [];
    return cacheGet(`gwPlayerStats_${mgrId}_${selectedGW}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedGW || !mgrId) return;

    // Skip fetch if we already have cached data for this GW + manager
    const key = `gwPlayerStats_${mgrId}_${selectedGW}`;
    if (gwPlayerStats.length > 0 && cacheGet(key)) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/${mgrId}/gw-player-stats/${selectedGW}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGWPlayerStats(data);
        cacheSet(key, data, TTL.GW_STATS);
      } catch (err) {
        console.error('Error fetching gw player stats', err);
        setError(err.message || 'Failed to fetch squad data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGW, mgrId]);

  return { gwPlayerStats, loading, error };
}
