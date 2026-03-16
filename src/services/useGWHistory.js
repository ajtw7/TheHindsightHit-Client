import { useEffect, useState } from 'react';

function cacheKey(mgrId) { return `cache_gwHistory_${mgrId}`; }

export default function useGWHistory(mgrId) {
  const [gwHistory, setGWHistory] = useState(() => {
    if (!mgrId) return [];
    try {
      const cached = sessionStorage.getItem(cacheKey(mgrId));
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mgrId) return;

    // Skip fetch if we already have cached data for this manager
    if (gwHistory.length > 0) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/gw-history/${mgrId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGWHistory(data);
        try { sessionStorage.setItem(cacheKey(mgrId), JSON.stringify(data)); } catch {}
      } catch (err) {
        console.error('Error fetching gw history', err);
        setError(err.message || 'Failed to fetch gameweek history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgrId]);

  return { gwHistory, loading, error };
}
