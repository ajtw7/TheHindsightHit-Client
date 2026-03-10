import { useState, useEffect } from 'react';

export default function useTeams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams', error);
      }
    };
    fetchData();
  }, []);

  return teams;
}
