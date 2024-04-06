import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Route, Link, Routes } from 'react-router-dom';
import useGameweeks from './services/useGameweeks';
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
  const { gameweeks } = useGameweeks();
  const [currentGW, setCurrentGW] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mgrId, setMgrId] = useState(null);

  const mgrData = useMgrData();
  const allPlayers = useAllPlayers();
  const { gwPlayerStats, loading: gwPlayerStatsLoading } =
    useGWPlayerStats(currentGW);
  const myTransfers = useTransfers();
  const gwHistory = useGWHistory();

  useEffect(() => {
    if (gameweeks.length > 0) {
      const currentGW = gameweeks.find((gw) => gw.is_current);
      const currentGWNumber = currentGW.id;
      setCurrentGW(currentGWNumber);
      setLoading(false);
      console.log('currentGW', { currentGW });
    }
  }, [gameweeks]);

  useEffect(() => {
    if (currentGW && mgrData && mgrData.id) {
      setMgrId(mgrData.id);
    }
  }, [currentGW, mgrData]);

  // have a homepage that allows managers to enter their team ID.
  // Once entered, the app should display the manager's profile, gameweek history, fixtures, and transfers.

  const myPlayerIds = useMemo(() => {
    return gwPlayerStats ? gwPlayerStats.map((player) => player.element) : [];
  }, [gwPlayerStats]);

  const myPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      return myPlayerIds.includes(player.id);
    });
  }, [allPlayers, myPlayerIds]);

  // Use the usePlayerHistories hook once for each player ID
  const playerHistories = usePlayerHistories(myPlayerIds);

  if (loading) {
    return <div>Loading something awesome... 😬</div>;
  }

  if (gwPlayerStatsLoading) {
    return <div>Loading player stats... 😬</div>;
  }

  return (
    <PlayerContext.Provider
      value={{
        currentGW,
        mgrData,
        myPlayerIds,
        myTransfers,
      }}
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
            <Route
              path="/manager-profile"
              element={<ManagerProfile myPlayers={myPlayers} />}
            />
            <Route
              path="/gameweek-history"
              element={
                <GWHistory
                  playerHistories={playerHistories}
                  gwHistory={gwHistory}
                  myPlayers={myPlayers}
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
