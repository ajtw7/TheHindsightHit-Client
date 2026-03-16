import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useTransfers(mgrId) {
  const [myTransfers, setMyTransfers] = useState(() => {
    if (!mgrId) return [];
    return cacheGet(`transfers_${mgrId}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mgrId) return;

    // Skip fetch if we already have cached data for this manager
    if (myTransfers.length > 0) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transfers/${mgrId}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setMyTransfers(data);
        cacheSet(`transfers_${mgrId}`, data, TTL.TRANSFERS);
      } catch (err) {
        console.error('Error fetching transfers', err);
        setError(err.message || 'Failed to fetch transfers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgrId]);

  return { myTransfers, loading, error };
}
