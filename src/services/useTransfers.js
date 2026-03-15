import { useState, useEffect } from 'react';

export default function useTransfers(mgrId) {
  const [myTransfers, setMyTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transfers/${mgrId}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setMyTransfers(data);
      } catch (err) {
        console.error('Error fetching transfers', err);
        setError(err.message || 'Failed to fetch transfers');
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);
  return { myTransfers, loading, error };
}
