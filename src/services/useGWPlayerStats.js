import { useState, useEffect } from 'react';

export default function useGWPlayerStats(gameweek) {
  const [gwPlayerStats, setGWPlayerStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/gw-player-stats/${gameweek}`
        );
        const data = await res.json();
        setGWPlayerStats(data);
      } catch (error) {
        console.error('Error fetching gw player stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (gameweek) {
      fetchData();
    }
  }, [gameweek]);

  return { gwPlayerStats, loading };
}
