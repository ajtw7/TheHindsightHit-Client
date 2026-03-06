import { useState, useEffect } from 'react';

export default function useAllPlayers() {
  const [allPlayers, setAllPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-players`);
        const data = await res.json();
        setAllPlayers((_prevAllPlayers) => {
          return data;
        });
      } catch (error) {
        console.error('Error fetching players', error);
      }
    };
    fetchData();
  }, []);

  return allPlayers;
}

// Path: src/services/useAllPlayers.js
