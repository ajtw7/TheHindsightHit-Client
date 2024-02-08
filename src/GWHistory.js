import { useEffect, useState } from 'react';

export default function GWHistory() {
  const [gwHistory, setGWHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gw-history');
        const data = await res.json();
        setGWHistory((_prevGWHistory) => {
          return data;
        });
        console.log('these are the gw history', gwHistory);
      } catch (error) {
        console.error('Error fetching gw history', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      {gwHistory.map((gw) => (
        <div key={gw.id} style={{ padding: 10 }}>
          <p>GW: {gw.event}</p>
          <p>Points: {gw.points}</p>
          <br />
        </div>
      ))}
    </div>
  );
}
// Path: src/AllPlayers.js
