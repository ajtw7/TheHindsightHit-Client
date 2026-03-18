import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

const CACHE_KEY = 'teams';

export default function useTeams(enabled = true) {
  const [teams, setTeams] = useState(() => cacheGet(CACHE_KEY) ?? []);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    if (teams.length > 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setTeams(data);
        cacheSet(CACHE_KEY, data, TTL.TEAMS);
      } catch (err) {
        console.error('Error fetching teams', err);
        setError(err.message || 'Failed to fetch teams');
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { teams, error };
}
