import { useState, useEffect } from 'react';

export default function useGWPlayerStats(selectedGW, mgrId) {
  const [gwPlayerStats, setGWPlayerStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://3.147.48.156:5000/api/${mgrId}/gw-player-stats/${selectedGW}`
        );
        const data = await res.json();
        setGWPlayerStats(data);
      } catch (error) {
        console.error('Error fetching gw player stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGW && mgrId) {
      fetchData();
    }
  }, [selectedGW, mgrId]);

  return { gwPlayerStats, loading };
}
