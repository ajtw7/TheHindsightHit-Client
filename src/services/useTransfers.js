import { useState, useEffect } from 'react';

export default function useTransfers(mgrId) {
  const [myTransfers, setMyTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transfers/${mgrId}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setMyTransfers(data);
      } catch (error) {
        console.error('Error fetching transfers', error);
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);
  return { myTransfers, loading };
}
