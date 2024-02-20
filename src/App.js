import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import fetch from 'node-fetch';
import MgrProfile from './MgrProfile';
import AllPlayers from './services/useAllPlayers';
import GWHistory from './GWHistory';
import PlayerStats from './services/usePlayerHistories';
import './styles/App.css';

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
    <Router>
      <div className="App">
        <h1>THE HINDSIGHT HIT</h1>

        <nav className="sticky-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/manager-profile">Manager Profile</Link>
            </li>
            <li>
              <Link to="/gameweek-history">GW History</Link>
            </li>
            <li>
              <Link to="/all-players">All Players</Link>
            </li>
            <li>
              <Link to="/player-stats">Player Stats</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/manager-profile" element={<MgrProfile />} />
          <Route path="/gameweek-history" element={<GWHistory />} />
          <Route path="/all-players" element={<AllPlayers />} />
          <Route path="/player-stats" element={<PlayerStats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
