import { useState, useEffect, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useTransfers(mgrId) {
  const [myTransfers, setMyTransfers] = useState(() => {
    if (!mgrId) return [];
    return cacheGet(`transfers_${mgrId}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevMgrId = useRef(mgrId);

  useEffect(() => {
    if (!mgrId) {
      setMyTransfers([]);
      setError(null);
      return;
    }

    // When mgrId changes, reset state and try cache for the new ID
    if (prevMgrId.current !== mgrId) {
      prevMgrId.current = mgrId;
      setError(null);
      const cached = cacheGet(`transfers_${mgrId}`);
      if (cached) {
        setMyTransfers(cached);
        return;
      }
      setMyTransfers([]);
    } else if (myTransfers.length > 0) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transfers/${mgrId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.error && body.code) {
            setError({ code: body.code, message: body.message });
            return;
          }
          throw new Error(`HTTP error: ${res.status}`);
        }
        const data = await res.json();
        if (data.error === true && data.code) {
          setError({ code: data.code, message: data.message });
          return;
        }
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
