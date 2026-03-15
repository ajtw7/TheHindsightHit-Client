import { useState, useEffect } from 'react';

const CACHE_KEY = 'cache_gameweeks';

export default function useGameweeks() {
  const [gameweeks, setGameweeks] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip fetch if we already have cached data from sessionStorage
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
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
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
