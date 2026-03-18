import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState(() => {
    if (!mgrId) return {};
    return cacheGet(`mgrData_${mgrId}`) ?? {};
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
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.error && body.code) {
            setError({ code: body.code, message: body.message });
            return;
          }
          throw new Error(`HTTP error: ${res.status}`);
        }
        const data = await res.json();
        setMgrData(data);
        cacheSet(`mgrData_${mgrId}`, data, TTL.MGR_DATA);
      } catch (err) {
        console.error('Error fetching manager data', err);
        const isNetwork = !err.message?.startsWith('HTTP');
        setError({
          code: isNetwork ? 'NETWORK_ERROR' : 'SERVER_ERROR',
          message: err.message || 'Failed to fetch manager data',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgrId]);

  return { mgrData, loading, error };
}
