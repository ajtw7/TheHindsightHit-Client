import { useState, useEffect } from 'react';

export default function useAllData() {
  const [currentGW, setCurrentGW] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-data`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        const currentGW = data.find((event) => event.is_current === true);
        setCurrentGW(currentGW ?? null);
      } catch (error) {
        console.error('Error fetching all data', error);
      }
    };
    fetchData();
  }, []);

  return currentGW;
}
