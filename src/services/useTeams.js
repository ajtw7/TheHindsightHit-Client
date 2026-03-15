import { useState, useEffect } from 'react';

const CACHE_KEY = 'cache_teams';

export default function useTeams() {
  const [teams, setTeams] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teams.length > 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setTeams(data);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
      } catch (err) {
        console.error('Error fetching teams', err);
        setError(err.message || 'Failed to fetch teams');
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { teams, error };
}
