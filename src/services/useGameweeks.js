import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

const CACHE_KEY = 'gameweeks';

export default function useGameweeks() {
  const [gameweeks, setGameweeks] = useState(() => cacheGet(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip fetch if we already have cached data
    if (gameweeks.length > 0) {
      setLoading(false);
      return;
    }

    const fetchGameweekData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/gameweeks`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGameweeks(data);
        cacheSet(CACHE_KEY, data, TTL.GAMEWEEKS);
      } catch (err) {
        console.error('Error fetching gameweeks.', err);
        setError(err.message || 'Failed to fetch gameweeks');
      } finally {
        setLoading(false);
      }
    };
    fetchGameweekData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { gameweeks, loading, error };
}
