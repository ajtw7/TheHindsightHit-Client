import { useState, useEffect } from 'react';

const CACHE_KEY = 'cache_allPlayers';

export default function useAllPlayers() {
  const [allPlayers, setAllPlayers] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (allPlayers.length > 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-players`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setAllPlayers(data);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
      } catch (err) {
        console.error('Error fetching players', err);
        setError(err.message || 'Failed to fetch players');
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { allPlayers, error };
}
