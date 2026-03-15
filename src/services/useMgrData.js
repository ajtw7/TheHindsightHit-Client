import { useState, useEffect } from 'react';

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/mgr-profile/${mgrId}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setMgrData(data);
      } catch (err) {
        console.error('Error fetching manager data', err);
        setError(err.message || 'Failed to fetch manager data');
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);

  return { mgrData, loading, error };
}
