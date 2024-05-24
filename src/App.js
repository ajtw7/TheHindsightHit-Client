import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useGameweeks from './services/useGameweeks';
import useAllPlayers from './services/useAllPlayers';
import useMgrData from './services/useMgrData';
import useGWPlayerStats from './services/useGWPlayerStats';
import usePlayerHistories from './services/usePlayerHistories';
import useTransfers from './services/useTransfers';
import useGWHistory from './services/useGWHistory';
import Nav from './Components/Nav';
import HomePage from './HomePage';
import ManagerProfile from './ManagerProfile';
import GWHistory from './GWHistory';
import Fixtures from './Fixtures';
import Transfers from './Transfers';
import { PlayerContext } from './services/context';
import { SelectedGWContext } from './services/context';
import './styles/App.css';

function App() {
  const { gameweeks } = useGameweeks();
  const [currentGW, setCurrentGW] = useState(null);
  const [selectedGW, setSelectedGW] = useState(currentGW);
  const [mgrId, setMgrId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mgrData } = useMgrData(mgrId);
  const allPlayers = useAllPlayers();
  const { gwPlayerStats, loading: gwPlayerStatsLoading } = useGWPlayerStats(
    selectedGW,
    mgrId
  );
  const { myTransfers } = useTransfers(mgrId);
  const { gwHistory, gwHistoryLoading } = useGWHistory(mgrId);

  useEffect(() => {
    if (gameweeks.length > 0) {
      const currentGW = gameweeks.find((gw) => gw.is_current);
      if (currentGW) {
        setCurrentGW(currentGW);
        setSelectedGW(currentGW.id);
        setLoading(false);
        console.log('currentGW', { currentGW });
      }
    }
  }, [gameweeks]);

  const myPlayerIds = useMemo(() => {
    return gwPlayerStats ? gwPlayerStats.map((player) => player.element) : [];
  }, [gwPlayerStats]);

  const myPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      return myPlayerIds.includes(player.id);
    });
  }, [allPlayers, myPlayerIds]);

  // Use the usePlayerHistories hook once for each player ID
  // const playerHistories = usePlayerHistories(myPlayerIds);

  if (loading || gwPlayerStatsLoading || gwHistoryLoading) {
    return <div>Loading something awesome... 😬</div>;
  }

  if (mgrId === null) {
    return <HomePage setMgrId={setMgrId} />;
  }

  return (
    <SelectedGWContext.Provider value={{ selectedGW }}>
      <PlayerContext.Provider
        value={{
          currentGW,
          mgrData,
          myPlayerIds,
          allPlayers,
        }}
      >
        <div className="App">
          <Nav />
          <Routes>
            <Route path="/" element={<HomePage setMgrId={setMgrId} />} />
            <Route
              path="/manager-profile"
              element={<ManagerProfile myPlayers={myPlayers} />}
            />
            <Route
              path="/gameweek-history"
              element={
                <GWHistory
                  gwHistory={gwHistory}
                  myPlayers={myPlayers}
                  setSelectedGW={setSelectedGW}
                  myTransfers={myTransfers}
                />
              }
            />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route
              path="/transfers"
              element={<Transfers myTransfers={myTransfers} />}
            />
          </Routes>
        </div>
      </PlayerContext.Provider>
    </SelectedGWContext.Provider>
  );
}

export default App;
