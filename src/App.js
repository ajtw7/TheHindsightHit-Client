import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import React, { useMemo } from 'react';
import useAllPlayers from './services/useAllPlayers';
import useMgrData from './services/useMgrData';
import useGWPlayerStats from './services/useGWPlayerStats';
import usePlayerHistories from './services/usePlayerHistories';
import ManagerProfile from './ManagerProfile';
import GWHistory from './GWHistory';
import Fixtures from './Fixtures';
import './styles/App.css';

export const PlayerContext = React.createContext();

function App() {
  const mgrData = useMgrData();
  const allPlayers = useAllPlayers();
  const myPlayerStats = useGWPlayerStats();

  const myPlayerIds = useMemo(() => {
    return myPlayerStats ? myPlayerStats.map((player) => player.element) : [];
  }, [myPlayerStats]);

  const myPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      return myPlayerIds.includes(player.id);
    });
  }, [allPlayers, myPlayerIds]);

  // Use the usePlayerHistories hook once for each player ID
  const playerHistories = usePlayerHistories(myPlayerIds);

  return (
    <PlayerContext.Provider
      value={{ mgrData, myPlayerIds, myPlayers, playerHistories }}
    >
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
              {/* <li>
                <Link to="/all-players">All Players</Link>
              </li> */}
              <li>
                <Link to="/player-stats">Player Stats</Link>
              </li>
              <li>
                <Link to="/fixtures">Fixtures</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/manager-profile" element={<ManagerProfile />} />
            <Route path="/gameweek-history" element={<GWHistory />} />
            {/* <Route path="/all-players" element={<useAllPlayers />} /> */}
            <Route path="/player-stats" element={<useGWPlayerStats />} />
            <Route path="/fixtures" element={<Fixtures />} />
          </Routes>
        </div>
      </Router>
    </PlayerContext.Provider>
  );
}

export default App;
