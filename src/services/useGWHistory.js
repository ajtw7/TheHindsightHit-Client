import { useEffect, useState } from 'react';

export default function useGWHistory() {
  const [gwHistory, setGWHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gw-history');
        const data = await res.json();
        setGWHistory((_prevGWHistory) => {
          return data;
        });
        console.log('these are the gw history', gwHistory);
      } catch (error) {
        console.error('Error fetching gw history', error);
      }
    };
    fetchData();
  }, []);

  return gwHistory;
}

// Path: src/services/useGWHistory.js
