import { useState, useEffect } from 'react';

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/mgr-profile/${mgrId}`
        );
        const data = await res.json();
        setMgrData((_prevMgrData) => {
          return data;
        });
      } catch (error) {
        console.error('Error fetching manager data', error);
      } finally {
        setLoading(false);
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);

  return { mgrData, loading };
}
