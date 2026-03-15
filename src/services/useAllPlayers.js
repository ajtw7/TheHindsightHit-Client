import { useState, useEffect } from 'react';

export default function useAllPlayers() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-players`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setAllPlayers(data);
      } catch (err) {
        console.error('Error fetching players', err);
        setError(err.message || 'Failed to fetch players');
      }
    };
    fetchData();
  }, []);

  return { allPlayers, error };
}

// Path: src/services/useAllPlayers.js
