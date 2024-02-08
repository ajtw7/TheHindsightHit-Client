import { useState, useEffect } from 'react';
import fetch from 'node-fetch';
import MgrProfile from './MgrProfile';
import './App.css';
import AllPlayers from './AllPlayers';
import GWHistory from './GWHistory';

function App() {
  // const [mgrData, setMgrData] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/fixtures');
        const data = await res.json();
        setFixtures((prevFixtures) => {
          return data;
        });
        console.log('these are the fixtures', fixtures);
      } catch (error) {
        console.error('Error fetching fixtures', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>THE HINDSIGHT HIT</h1>
      <MgrProfile />
      <hr />
      <GWHistory />
      <hr />
      <AllPlayers />
      <div
        style={{
          width: '100%',
          height: '10vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      ></div>
    </div>
  );
}

export default App;
