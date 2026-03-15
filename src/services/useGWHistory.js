import { useEffect, useState } from 'react';

export default function useGWHistory(mgrId) {
  const [gwHistory, setGWHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/gw-history/${mgrId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGWHistory(data);
      } catch (err) {
        console.error('Error fetching gw history', err);
        setError(err.message || 'Failed to fetch gameweek history');
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);

  return { gwHistory, loading, error };
}

// Path: src/services/useGWHistory.js
