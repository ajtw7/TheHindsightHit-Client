import { useState, useEffect } from 'react';

export default function useAllData() {
  const [currentGW, setCurrentGW] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-data`);
        const data = await res.json();
        const currentGW = data.find((event) => event.is_current === true);
        setCurrentGW(currentGW);
        console.log('currentGW', currentGW);
      } catch (error) {
        console.error('Error fetching all data', error);
      }
    };
    fetchData();
  }, []);

  return currentGW;
}
