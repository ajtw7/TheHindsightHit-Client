import { useState, useEffect } from 'react';

function cacheKey(mgrId, gw) { return `cache_gwPlayerStats_${mgrId}_${gw}`; }

export default function useGWPlayerStats(selectedGW, mgrId) {
  const [gwPlayerStats, setGWPlayerStats] = useState(() => {
    if (!selectedGW || !mgrId) return [];
    try {
      const cached = sessionStorage.getItem(cacheKey(mgrId, selectedGW));
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedGW || !mgrId) return;

    // Skip fetch if we already have cached data for this GW + manager
    if (gwPlayerStats.length > 0) {
      const ck = cacheKey(mgrId, selectedGW);
      try {
        if (sessionStorage.getItem(ck)) return;
      } catch {}
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
        try { sessionStorage.setItem(cacheKey(mgrId, selectedGW), JSON.stringify(data)); } catch {}
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
