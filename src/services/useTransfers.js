import { useState, useEffect } from 'react';

export default function useTransfers() {
  const [myTransfers, setMyTransfers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transfers/');
        const data = await res.json();
        setMyTransfers((_prevTransfers) => {
          return data;
        });
      } catch (error) {
        console.error('Error fetching transfers', error);
      }
    };
    fetchData();
  }, []);
  return myTransfers;
}
