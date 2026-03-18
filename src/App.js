import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useMatch } from 'react-router-dom';
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
  const navigate = useNavigate();

  // URL is the single source of truth for managerId.
  // useMatch extracts it from /manager/:mgrId/* routes.
  const match = useMatch('/manager/:mgrId/*');
  const urlMgrId = match?.params?.mgrId ? Number(match.params.mgrId) : null;

  // mgrId = URL param when on a /manager/ route, otherwise null.
  // localStorage is only used as a fetch-cache key, never as source of truth.
  const mgrId = urlMgrId;
  const hasMgrId = !!mgrId;

  // Bootstrap hooks — only fetch when a manager ID is present.
  // Cache hydration (useState initialiser) still runs on mount so
  // cached data is available instantly when the user submits a team ID.
  const { gameweeks, error: gameweeksError } = useGameweeks(hasMgrId);
  const [currentGW, setCurrentGW] = useState(null);
  const [selectedGW, setSelectedGW] = useState(currentGW);
  const [loading, setLoading] = useState(true);
  const [isOffSeason, setIsOffSeason] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Setter used by HomePage to navigate (not to set state directly)
  const setMgrId = useCallback((id) => {
    if (id) {
      navigate(`/manager/${id}/transfers`);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const { mgrData, error: mgrDataError } = useMgrData(mgrId);

  // Handle NOT_FOUND — redirect to "/" with error banner
  useEffect(() => {
    if (!mgrDataError?.code) return;
    if (mgrDataError.code === 'NOT_FOUND') {
      setErrorBanner("We couldn't find that team. Please check your Team ID and try again.");
      navigate('/', { replace: true });
    }
  }, [mgrDataError, navigate]);

  const { allPlayers, error: allPlayersError } = useAllPlayers(hasMgrId);
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

  const { teams, error: teamsError } = useTeams(hasMgrId);

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

  const allPlayersById = useMemo(
    () => allPlayers.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [allPlayers]
  );

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

  const isPrivateTeam = mgrDataError?.code === 'PRIVATE_TEAM';

  const isServerDown = [gameweeksError, allPlayersError, teamsError].some(
    (e) => e && (typeof e === 'string' ? e.includes('fetch') : e?.code === 'NETWORK_ERROR')
  );

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
    navigate('/');
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm tracking-wide">Loading your data…</p>
      </div>
    );
  }

  if (appErrors.length > 0 && mgrId) {
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

  // Error banner component (shown on landing page after redirect)
  const bannerEl = errorBanner ? (
    <div className="rounded-xl p-3 flex items-start justify-between gap-2" style={{ backgroundColor: '#ef4444' }}>
      <p className="text-white text-sm">{errorBanner}</p>
      <button onClick={() => setErrorBanner(null)} className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0">✕</button>
    </div>
  ) : null;

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
          {mgrId && <Header mgrId={mgrId} onSwitchTeam={handleSwitchTeam} />}
          {mgrId && isOffSeason && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center px-4 py-2">
              No active gameweek — showing most recent data
            </div>
          )}
          {mgrId && isPrivateTeam && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center px-4 py-3">
              This team is set to private on FPL. Update your privacy settings to use The Hindsight Hit.
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage setMgrId={setMgrId} errorBanner={bannerEl} />} />
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
            {/* Redirect old bookmarked URLs — no longer possible without state-based mgrId */}
            <Route path="/manager-profile" element={<Navigate to="/" replace />} />
            <Route path="/gameweek-history" element={<Navigate to="/" replace />} />
            <Route path="/fixtures" element={<Navigate to="/" replace />} />
            <Route path="/transfers" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PlayerContext.Provider>
    </SelectedGWContext.Provider>
  );
}

export default App;
