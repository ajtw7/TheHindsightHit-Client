import { useState, useEffect } from 'react';

export default function useTransfers(mgrId) {
  const [myTransfers, setMyTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/transfers/${mgrId}`);
        const data = await res.json();
        setMyTransfers((_prevTransfers) => {
          return data;
        });
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
