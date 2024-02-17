import { useState, useEffect } from 'react';

export default function AllPlayers() {
  const [allPlayers, setAllPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/all-players');
        const data = await res.json();
        setAllPlayers((prevAllPlayers) => {
          return data;
        });
        console.log('these are the players', allPlayers);
      } catch (error) {
        console.error('Error fetching players', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '100%',
        height: '100vh',
      }}
    >
      {allPlayers.map((player) => (
        <div key={player.id} style={{ width: '20%', height: 'auto' }}>
          {player.team === 1 && (
            <>
              <p>First Name: {player.first_name}</p>
              <p>Last Name: {player.second_name}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
