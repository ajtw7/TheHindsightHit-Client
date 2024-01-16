import { useState, useEffect } from 'react';
import fetch from 'node-fetch';
import './App.css';

function App() {
  // const [mgrData, setMgrData] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  // useEffect(() => {
  //   fetch('http://localhost:5000/api/mgr-profile')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // console.log('data', data);
  //       setMgrData(data);
  //     });
  // });

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
      <div
        style={{
          width: '100%',
          height: '10vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* <>{mgrData.id}</>
        <>{mgrData.name}</> */}
      </div>
      <div>
        {fixtures.map((fix) => (
          <div key={fix.id}>
            <p>Event: {fix.event}</p>
            <p>Pulse Id: {fix.pulse_id}</p>
            <p>Team: {fix.team_a}</p>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
