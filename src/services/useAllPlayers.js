import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

const CACHE_KEY = 'allPlayers';

export default function useAllPlayers(enabled = true) {
  const [allPlayers, setAllPlayers] = useState(() => cacheGet(CACHE_KEY) ?? []);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    if (allPlayers.length > 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-players`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setAllPlayers(data);
        cacheSet(CACHE_KEY, data, TTL.ALL_PLAYERS);
      } catch (err) {
        console.error('Error fetching players', err);
        setError(err.message || 'Failed to fetch players');
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { allPlayers, error };
}
