import { useState, useEffect, useRef } from 'react';

export default function usePlayerHistories(elementIds) {
  const [playerHistories, setPlayerHistories] = useState([]);
  const cache = useRef({});

  useEffect(() => {
    if (elementIds.length === 0) {
      setPlayerHistories([]);
      return;
    }
    const fetchData = async () => {
      try {
        const limit = 10;
        const queue = [...elementIds];
        const results = [];

        while (queue.length > 0) {
          const promises = queue.splice(0, limit).map(async (id) => {
            if (cache.current[id]) {
              return cache.current[id];
            }
            const res = await fetch(
              `http://3.147.48.156:5000/api/player-history/${id}`
            );
            const data = await res.json();
            cache.current[id] = data;
            return data;
          });
          results.push(...(await Promise.all(promises)));
        }
        setPlayerHistories(results);
      } catch (error) {
        console.error('Error fetching player history', error);
        return [];
      }
    };
    fetchData();
  }, [elementIds]);
  return playerHistories;
}

// Path: src/usePlayerHistories.js
