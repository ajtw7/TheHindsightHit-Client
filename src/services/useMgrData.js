import { useState, useEffect } from 'react';

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://3.147.48.156:5000/api/mgr-profile/${mgrId}`
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
