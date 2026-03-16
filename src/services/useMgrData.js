import { useState, useEffect } from 'react';

function cacheKey(mgrId) { return `cache_mgrData_${mgrId}`; }

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState(() => {
    if (!mgrId) return {};
    try {
      const cached = sessionStorage.getItem(cacheKey(mgrId));
      return cached ? JSON.parse(cached) : {};
    } catch { return {}; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mgrId) return;

    // Skip fetch if we already have cached data for this manager
    if (mgrData.id && String(mgrData.id) === String(mgrId)) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/mgr-profile/${mgrId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setMgrData(data);
        try { sessionStorage.setItem(cacheKey(mgrId), JSON.stringify(data)); } catch {}
      } catch (err) {
        console.error('Error fetching manager data', err);
        setError(err.message || 'Failed to fetch manager data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgrId]);

  return { mgrData, loading, error };
}
