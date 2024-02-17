import { useState, useEffect } from 'react';

export default function PlayerStats() {
  const [gwStats, setGWStats] = useState([]);
  //   const {
  //     element,
  //     fixture,
  //     total_points,
  //     goals_scored,
  //     assists,
  //     clean_sheets,
  //     bonus,
  //   } = playerStats;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/player-history/');
        const data = await res.json();
        setGWStats((_tempGWStats) => {
          return data;
        });
        console.log('this is the player stats', gwStats);
      } catch (error) {
        console.error('this is the player stats', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {gwStats.map((gw) => (
        <div key={gw.id} style={{ padding: 10 }}>
          <p>GW: {gw.element}</p>
          <p>Points: {gw.total_points}</p>
          <p>Goals: {gw.goals_scored}</p>
          <p>Assists: {gw.assists}</p>
        </div>
      ))}
    </>
  );
}
// Path: src/PlayerStats.js
