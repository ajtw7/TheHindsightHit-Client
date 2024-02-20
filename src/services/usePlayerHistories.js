import { useState, useEffect } from 'react';

export default function usePlayerHistories(elementIds) {
  const [playerHistories, setPlayerHistories] = useState([]);
  //   const {
  //     element,
  //     fixture,
  //     total_points,
  //     goals_scored,
  //     assists,
  //     clean_sheets,
  //     bonus,
  //   } = playerHistories;

  useEffect(() => {
    if (elementIds.length === 0) {
      setPlayerHistories([]);
      return;
    }
    const fetchData = async () => {
      try {
        const histories = await Promise.all(
          elementIds.map(async (id) => {
            const res = await fetch(
              `http://localhost:5000/api/player-history/${id}`
            );
            const data = await res.json();
            return data;
          })
        );
        setPlayerHistories(histories);
      } catch (error) {
        console.error('Error fetching player history', error);
      }
    };
    fetchData();
  }, [elementIds]);

  return playerHistories;
}
// Path: src/usePlayerHistories.js
