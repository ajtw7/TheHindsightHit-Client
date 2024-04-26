import { useState, useEffect } from 'react';

export default function useGWPlayerStats() {
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://3.147.48.156:5000/api/fixtures');
        const data = await res.json();
        setFixtures((_prevFixtures) => {
          return data;
        });
        console.log('these are the fixtures', fixtures);
      } catch (error) {
        console.error('Error fetching fixtures', error);
      }
    };
    fetchData();
  }, [fixtures]);
  return fixtures;
}
// Path: src/services/useFixtures.js
