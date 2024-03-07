import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Route, Link, Routes } from 'react-router-dom';
import useAllData from './services/useAllData';
import useAllPlayers from './services/useAllPlayers';
import useMgrData from './services/useMgrData';
import useGWPlayerStats from './services/useGWPlayerStats';
import usePlayerHistories from './services/usePlayerHistories';
import useTransfers from './services/useTransfers';
import useGWHistory from './services/useGWHistory';
import ManagerProfile from './ManagerProfile';
import GWHistory from './GWHistory';
import Fixtures from './Fixtures';
import Transfers from './Transfers';
import { PlayerContext } from './services/context';
import './styles/App.css';

function App() {
  // const [currentGW, setCurrentGW] = useState(null);
  const currentGW = useAllData();
  console.log('currentGW', currentGW);
  const [mgrId, setMgrId] = useState(null);
  // have a homepage that allows managers to enter their team ID.
  // Once entered, the app should display the manager's profile, gameweek history, fixtures, and transfers.
  const mgrData = useMgrData();
  const allPlayers = useAllPlayers();
  const myPlayerStats = useGWPlayerStats(currentGW);
  const myTransfers = useTransfers();
  const gwHistory = useGWHistory();

  useEffect(() => {
    if (mgrData && mgrData.id) {
      setMgrId(mgrData.id);
    }
  }, [mgrData]);

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
      value={{ mgrData, myPlayerIds, myPlayers, playerHistories, myTransfers }}
    >
      <BrowserRouter>
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
                <Link to="/fixtures">Fixtures</Link>
              </li>
              <li>
                <Link to="/transfers">Transfers</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/manager-profile" element={<ManagerProfile />} />
            <Route
              path="/gameweek-history"
              element={
                <GWHistory
                  mgrData={mgrData}
                  currentGW={currentGW}
                  // setCurrentGW={setCurrentGW}
                  myPlayers={myPlayers}
                  playerHistories={playerHistories}
                  myTransfers={myTransfers}
                  gwHistory={gwHistory}
                />
              }
            />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/transfers" element={<Transfers />} />
          </Routes>
        </div>
      </BrowserRouter>
    </PlayerContext.Provider>
  );
}

export default App;
