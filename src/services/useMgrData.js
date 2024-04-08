import { useState, useEffect } from 'react';

export default function useMgrData(mgrId) {
  const [mgrData, setMgrData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
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
      }
    };
    if (mgrId) {
      fetchData();
    }
  }, [mgrId]);

  return mgrData;
}
