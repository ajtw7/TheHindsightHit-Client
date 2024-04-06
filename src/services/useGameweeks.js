import { useState, useEffect } from 'react';

export default function useGameweeks() {
  const [gameweeks, setGameweeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameweekData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gameweeks');
        const data = await res.json();
        setGameweeks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gameweeks.');
        setLoading(false);
      }
    };
    fetchGameweekData();
  }, []);

  return { gameweeks, loading };
}
