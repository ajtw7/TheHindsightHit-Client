import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useGameweeks from './services/useGameweeks';
import useAllPlayers from './services/useAllPlayers';
import useMgrData from './services/useMgrData';
import useGWPlayerStats from './services/useGWPlayerStats';
import useTransfers from './services/useTransfers';
import useGWHistory from './services/useGWHistory';
import usePlayerHistories from './services/usePlayerHistories';
import { useManageUniquePlayerHistories } from './services/useManageUniquePlayerHistories';
import useTeams from './services/useTeams';
import Header from './Components/Header';
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
  // Always fetch stats for the CURRENT GW so that the Manager Profile
  // squad display is never affected by the GW History dropdown selection.
  const { gwPlayerStats, loading: gwPlayerStatsLoading } = useGWPlayerStats(
    currentGW?.id,
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
      }
    }
  }, [gameweeks]);

  const myPlayerIds = useMemo(() => {
    return gwPlayerStats ? gwPlayerStats.map((player) => player.element) : [];
  }, [gwPlayerStats]);

  const myPlayers = useMemo(() => {
    const statsById = gwPlayerStats.reduce((acc, s) => {
      acc[s.element] = s;
      return acc;
    }, {});
    return allPlayers
      .filter((p) => myPlayerIds.includes(p.id))
      .map((p) => {
        const stats = statsById[p.id];
        return { ...p, squadPosition: stats?.position, multiplier: stats?.multiplier };
      });
  }, [allPlayers, myPlayerIds, gwPlayerStats]);

  const teams = useTeams();

  const allPlayerIds = useMemo(() => allPlayers.map((p) => p.id), [allPlayers]);
  const allPlayerHistories = usePlayerHistories(allPlayerIds);
  const [uniquePlayerHistories] = useManageUniquePlayerHistories(allPlayerHistories);

  if (loading || gwPlayerStatsLoading || gwHistoryLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm tracking-wide">Loading your data…</p>
      </div>
    );
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
          uniquePlayerHistories,
          teams,
        }}
      >
        <div className="App">
          <Header />
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
