import { useState, useEffect, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useGWPlayerStats(selectedGW, mgrId) {
  const [gwPlayerStats, setGWPlayerStats] = useState(() => {
    if (!selectedGW || !mgrId) return [];
    return cacheGet(`gwPlayerStats_${mgrId}_${selectedGW}`) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevKey = useRef(`${mgrId}_${selectedGW}`);

  useEffect(() => {
    if (!selectedGW || !mgrId) return;

    const key = `gwPlayerStats_${mgrId}_${selectedGW}`;
    const currentKey = `${mgrId}_${selectedGW}`;

    // When params change, reset state and try cache
    if (prevKey.current !== currentKey) {
      prevKey.current = currentKey;
      setError(null);
      const cached = cacheGet(key);
      if (cached) {
        setGWPlayerStats(cached);
        return;
      }
      setGWPlayerStats([]);
    } else if (gwPlayerStats.length > 0 && cacheGet(key)) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/${mgrId}/gw-player-stats/${selectedGW}`
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
