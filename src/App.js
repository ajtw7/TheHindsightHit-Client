import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useGameweeks from './services/useGameweeks';
import useAllPlayers from './services/useAllPlayers';
import useMgrData from './services/useMgrData';
import useGWPlayerStats from './services/useGWPlayerStats';
import useTransfers from './services/useTransfers';
import useGWHistory from './services/useGWHistory';
import useGWLiveStats from './services/useGWLiveStats';
import useHistoricalPrices from './services/useHistoricalPrices';
import useTeams from './services/useTeams';
import Header from './Components/Header';
import HomePage from './HomePage';
import ManagerProfile from './ManagerProfile';
import GWHistory from './GWHistory';
import Fixtures from './Fixtures';
import Transfers from './Transfers';
import { PlayerContext } from './services/context';
import { SelectedGWContext } from './services/context';
import { ProfileSkeleton, GWHistorySkeleton } from './Components/Skeleton';
import './styles/App.css';

function App() {
  const { gameweeks, error: gameweeksError } = useGameweeks();
  const [currentGW, setCurrentGW] = useState(null);
  const [selectedGW, setSelectedGW] = useState(currentGW);
  const [mgrId, setMgrId] = useState(() => {
    const saved = localStorage.getItem('mgrId');
    return saved ? Number(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isOffSeason, setIsOffSeason] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const navigate = useNavigate();

  // Persist mgrId to localStorage
  useEffect(() => {
    if (mgrId) localStorage.setItem('mgrId', mgrId);
    else localStorage.removeItem('mgrId');
  }, [mgrId]);

  const { mgrData, error: mgrDataError } = useMgrData(mgrId);

  // Handle NOT_FOUND and PRIVATE_TEAM errors from mgrData
  useEffect(() => {
    if (!mgrDataError?.code) return;
    if (mgrDataError.code === 'NOT_FOUND') {
      setMgrId(null);
      setErrorBanner("We couldn't find that team. Please check your Team ID and try again.");
      navigate('/', { replace: true });
    }
  }, [mgrDataError, navigate]);
  const { allPlayers, error: allPlayersError } = useAllPlayers();
  // Always fetch stats for the CURRENT GW so that the Manager Profile
  // squad display is never affected by the GW History dropdown selection.
  const { gwPlayerStats, loading: gwPlayerStatsLoading, error: gwPlayerStatsError } = useGWPlayerStats(
    currentGW?.id,
    mgrId
  );
  const { myTransfers, error: transfersError } = useTransfers(mgrId);
  const { gwHistory, loading: gwHistoryLoading, error: gwHistoryError } = useGWHistory(mgrId);

  useEffect(() => {
    if (gameweeks.length > 0) {
      const current = gameweeks.find((gw) => gw.is_current);
      if (current) {
        setCurrentGW(current);
        setSelectedGW(current.id);
      } else {
        // Off-season fallback: use the last finished GW, or the last GW overall
        const fallback =
          [...gameweeks].reverse().find((gw) => gw.finished) ??
          gameweeks[gameweeks.length - 1];
        setCurrentGW(fallback);
        setSelectedGW(fallback.id);
        setIsOffSeason(true);
      }
      setLoading(false);
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

  const { teams, error: teamsError } = useTeams();

  // Only fetch GW-level data on pages that actually use it.
  // Transfers page: only GWs where transfers occurred.
  // GW History page: only GWs from gwHistory.
  const location = useLocation();
  const onTransfersPage = location.pathname.includes('/transfers');
  const onGWHistoryPage = location.pathname.includes('/gameweek-history');

  const activeGWIds = useMemo(() => {
    if (onTransfersPage) {
      return [...new Set(myTransfers.map((t) => t.event))];
    }
    if (onGWHistoryPage) {
      return [...new Set(gwHistory.map((h) => h.event))];
    }
    return [];
  }, [onTransfersPage, onGWHistoryPage, myTransfers, gwHistory]);
  const { gwLiveStats, error: gwLiveStatsError } = useGWLiveStats(activeGWIds, currentGW?.id);
  const { historicalPrices, error: historicalPricesError } = useHistoricalPrices(activeGWIds);

  // Fallback price lookup from allPlayers (now_cost) — used only when
  // historical prices are unavailable for a given GW/player.
  const allPlayersById = useMemo(
    () => allPlayers.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [allPlayers]
  );

  // Reconstruct uniquePlayerHistories in the same nested-array shape that
  // GWHistory and findAlternatives already expect.
  const uniquePlayerHistories = useMemo(() => {
    const byPlayer = {};
    for (const [gwId, data] of Object.entries(gwLiveStats)) {
      const elements = data.elements ?? [];
      const gwPrices = historicalPrices[gwId];
      for (const el of elements) {
        const id = el.id;
        if (!byPlayer[id]) byPlayer[id] = [];
        byPlayer[id].push({
          element: id,
          round: Number(gwId),
          total_points: el.stats.total_points,
          value: gwPrices?.[id] ?? allPlayersById[id]?.now_cost ?? 0,
          minutes: el.stats.minutes,
          goals_scored: el.stats.goals_scored,
        });
      }
    }
    return Object.values(byPlayer);
  }, [gwLiveStats, allPlayersById, historicalPrices]);

  // Check for private team error (shown inline, not as full-page error)
  const isPrivateTeam = mgrDataError?.code === 'PRIVATE_TEAM';

  // Check for server unavailable (network errors or 503s)
  const isServerDown = [gameweeksError, allPlayersError, teamsError].some(
    (e) => e && (typeof e === 'string' ? e.includes('fetch') : e?.code === 'NETWORK_ERROR')
  );

  // Don't count handled error codes (NOT_FOUND, PRIVATE_TEAM) as generic app errors
  const mgrDataIsGenericError = mgrDataError && !['NOT_FOUND', 'PRIVATE_TEAM'].includes(mgrDataError.code);

  const appErrors = [
    gameweeksError && 'Gameweek data',
    allPlayersError && 'Player data',
    mgrDataIsGenericError && 'Manager profile',
    gwPlayerStatsError && 'Squad data',
    transfersError && 'Transfer history',
    gwHistoryError && 'Gameweek history',
    teamsError && 'Team data',
    gwLiveStatsError && 'Live stats',
    historicalPricesError && 'Price data',
  ].filter(Boolean);

  const handleSwitchTeam = useCallback(() => {
    setMgrId(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm tracking-wide">Loading your data…</p>
      </div>
    );
  }

  if (appErrors.length > 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 px-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md w-full text-center">
          <h2 className="text-white text-lg font-bold mb-2">
            {isServerDown ? 'Server Unavailable' : 'Something went wrong'}
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            {isServerDown
              ? 'The server is temporarily unavailable. Please try again in a few minutes.'
              : `Failed to load: ${appErrors.join(', ')}`}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (mgrId === null) {
    const banner = errorBanner ? (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start justify-between gap-2">
        <p className="text-red-400 text-sm">{errorBanner}</p>
        <button onClick={() => setErrorBanner(null)} className="text-red-400 hover:text-white text-lg leading-none flex-shrink-0">✕</button>
      </div>
    ) : null;
    return (
      <Routes>
        <Route path="/" element={<HomePage setMgrId={setMgrId} errorBanner={banner} />} />
        {/* Redirect any /manager/... URL back to home when no team is selected */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
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
          <Header mgrId={mgrId} onSwitchTeam={handleSwitchTeam} />
          {isOffSeason && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center px-4 py-2">
              No active gameweek — showing most recent data
            </div>
          )}
          {isPrivateTeam && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center px-4 py-3">
              This team is set to private on FPL. Update your privacy settings to use The Hindsight Hit.
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage setMgrId={setMgrId} />} />
            <Route
              path="/manager/:mgrId/profile"
              element={
                gwPlayerStatsLoading || !mgrData?.id
                  ? <ProfileSkeleton />
                  : <ManagerProfile myPlayers={myPlayers} gwHistory={gwHistory} />
              }
            />
            <Route
              path="/manager/:mgrId/gameweek-history"
              element={
                gwHistoryLoading
                  ? <GWHistorySkeleton />
                  : <GWHistory
                      gwHistory={gwHistory}
                      myPlayers={myPlayers}
                      setSelectedGW={setSelectedGW}
                      myTransfers={myTransfers}
                      mgrId={mgrId}
                    />
              }
            />
            <Route path="/manager/:mgrId/fixtures" element={<Fixtures />} />
            <Route
              path="/manager/:mgrId/transfers"
              element={<Transfers myTransfers={myTransfers} mgrId={mgrId} />}
            />
            {/* Redirect old bookmarked URLs */}
            <Route path="/manager-profile" element={<Navigate to={`/manager/${mgrId}/profile`} replace />} />
            <Route path="/gameweek-history" element={<Navigate to={`/manager/${mgrId}/gameweek-history`} replace />} />
            <Route path="/fixtures" element={<Navigate to={`/manager/${mgrId}/fixtures`} replace />} />
            <Route path="/transfers" element={<Navigate to={`/manager/${mgrId}/transfers`} replace />} />
          </Routes>
        </div>
      </PlayerContext.Provider>
    </SelectedGWContext.Provider>
  );
}

export default App;
