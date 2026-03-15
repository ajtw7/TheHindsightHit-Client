import { useState, useEffect } from 'react';

export default function useGWPlayerStats(selectedGW, mgrId) {
  const [gwPlayerStats, setGWPlayerStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/${mgrId}/gw-player-stats/${selectedGW}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setGWPlayerStats(data);
      } catch (err) {
        console.error('Error fetching gw player stats', err);
        setError(err.message || 'Failed to fetch squad data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedGW && mgrId) {
      fetchData();
    }
  }, [selectedGW, mgrId]);

  return { gwPlayerStats, loading, error };
}
