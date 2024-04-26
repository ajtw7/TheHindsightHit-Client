import { useState, useEffect } from 'react';

export default function useAllData() {
  const [currentGW, setCurrentGW] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://3.147.48.156:5000/api/all-data');
        const data = await res.json();
        const currentGW = data.find((event) => event.is_current === true);
        setCurrentGW(currentGW);
        console.log('currentGW', currentGW);
      } catch (error) {
        console.error('Error fetching all data', error);
      }
    };
    fetchData();
  });

  return currentGW;
}
