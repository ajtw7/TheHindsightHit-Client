import { useState, useEffect } from 'react';

export default function useFixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/fixtures`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setFixtures(data);
      } catch (err) {
        console.error('Error fetching fixtures', err);
        setError(err.message || 'Failed to fetch fixtures');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { fixtures, loading, error };
}
