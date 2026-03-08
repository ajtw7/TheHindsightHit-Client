import { useEffect, useState } from 'react';

export default function useGWHistory(mgrId) {
  const [gwHistory, setGWHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/gw-history/${mgrId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGWHistory(data);
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
