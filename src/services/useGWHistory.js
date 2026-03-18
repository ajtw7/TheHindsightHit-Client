import { useEffect, useState, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useGWHistory(mgrId) {
  const [gwHistory, setGWHistory] = useState(() => {
    if (!mgrId) return [];
    return cacheGet(`gwHistory_${mgrId}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevMgrId = useRef(mgrId);

  useEffect(() => {
    if (!mgrId) {
      setGWHistory([]);
      setError(null);
      return;
    }

    // When mgrId changes, reset state and try cache for the new ID
    if (prevMgrId.current !== mgrId) {
      prevMgrId.current = mgrId;
      setError(null);
      const cached = cacheGet(`gwHistory_${mgrId}`);
      if (cached) {
        setGWHistory(cached);
        return;
      }
      setGWHistory([]);
    } else if (gwHistory.length > 0) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/gw-history/${mgrId}`
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
        if (data.error === true && data.code) {
          setError({ code: data.code, message: data.message });
          return;
        }
        setGWHistory(data);
        cacheSet(`gwHistory_${mgrId}`, data, TTL.GW_HISTORY);
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
