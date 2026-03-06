import { useState, useEffect } from 'react';

export default function useGWPlayerStats() {
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/fixtures`);
        const data = await res.json();
        setFixtures(data);
        console.log('these are the fixtures', data);
      } catch (error) {
        console.error('Error fetching fixtures', error);
      }
    };
    fetchData();
  }, []);
  return fixtures;
}
// Path: src/services/useFixtures.js
