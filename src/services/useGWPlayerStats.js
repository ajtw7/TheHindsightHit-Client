import { useState, useEffect } from 'react';

export default function useGWPlayerStats(gameweek) {
  const [gwPlayerStats, setGWPlayerStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/gw-player-stats/${gameweek}`
        );
        const data = await res.json();
        setGWPlayerStats(data);
      } catch (error) {
        console.error('Error fetching gw player stats', error);
      }
    };
    fetchData();
  }, [gameweek]);

  return gwPlayerStats;
}
