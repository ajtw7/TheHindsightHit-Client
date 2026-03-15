import { useState, useEffect } from 'react';

export default function useGameweeks() {
  const [gameweeks, setGameweeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameweekData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/gameweeks`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGameweeks(data);
      } catch (err) {
        console.error('Error fetching gameweeks.', err);
        setError(err.message || 'Failed to fetch gameweeks');
      } finally {
        setLoading(false);
      }
    };
    fetchGameweekData();
  }, []);

  return { gameweeks, loading, error };
}
