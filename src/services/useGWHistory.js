import { useEffect, useState } from 'react';

export default function useGWHistory(mgrId) {
  const [gwHistory, setGWHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/gw-history/${mgrId}`
        );
        const data = await res.json();
        setGWHistory((_prevGWHistory) => {
          return data;
        });
      } catch (error) {
        console.error('Error fetching gw history', error);
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);

  return { gwHistory, loading };
}

// Path: src/services/useGWHistory.js
