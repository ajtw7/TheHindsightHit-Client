import { useContext, useMemo } from 'react';
import { SelectedGWContext, PlayerContext } from './services/context';

export default function GWHistory({ gwHistory, myPlayers, setSelectedGW, myTransfers }) {
  const { selectedGW } = useContext(SelectedGWContext);
  const { allPlayers, myPlayerIds, uniquePlayerHistories } = useContext(PlayerContext);

  const selectedGWTransfers = myTransfers.filter(
    (transfer) => transfer.event === selectedGW
  );

  // Filter the shared pool down to only this manager's players — no extra fetches
  const myUniquePlayerHistories = useMemo(
    () => uniquePlayerHistories.filter((ph) => ph[0] && myPlayerIds.includes(ph[0].element)),
    [uniquePlayerHistories, myPlayerIds]
  );

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Gameweek History</h1>

      {/* GW selector */}
      <select
        id="gw-select"
        value={selectedGW}
        onChange={(e) => setSelectedGW(Number(e.target.value))}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-emerald-400"
      >
        {gwHistory.map((gw) => (
          <option key={gw.id} value={gw.event}>
            GW {gw.event}
          </option>
        ))}
      </select>

      {/* GW summary banner */}
      {gwHistory
        .filter((gw) => gw.event === selectedGW)
        .map((gw) => (
          <div
            key={gw.event}
            className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-4 mb-5 flex justify-between items-center"
          >
            <span className="text-slate-400 text-sm font-medium">Gameweek {gw.event}</span>
            <span className="text-emerald-400 text-2xl font-bold">{gw.points} pts</span>
          </div>
        ))}

      {/* Player cards */}
      <h2 className="text-base font-semibold text-slate-300 mb-3">Players</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {myUniquePlayerHistories.map((playerHistory) =>
          playerHistory
            .filter((gwData) => gwData.round === selectedGW)
            .map((gwData) => {
              const player = myPlayers.find((p) => p.id === gwData.element);
              if (!player) return null;
              return (
                <div
                  key={`${gwData.element}-${gwData.round}`}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4"
                >
                  <p className="text-white font-semibold text-sm mb-2 truncate">
                    {player.web_name}
                  </p>
                  <p className="text-emerald-400 text-2xl font-bold leading-none mb-1">
                    {gwData.total_points}
                  </p>
                  <p className="text-slate-500 text-xs mb-2">pts</p>
                  <div className="space-y-0.5 text-xs text-slate-400">
                    <p>{gwData.minutes} mins</p>
                    {gwData.goals_scored > 0 && (
                      <p className="text-emerald-400">{gwData.goals_scored} goal{gwData.goals_scored !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Transfers for this GW */}
      {selectedGWTransfers.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-3">Transfers</h2>
          <div className="space-y-2">
            {selectedGWTransfers.map((transfer) => {
              const playerIn = myPlayers.find((p) => p.id === transfer.element_in);
              const playerOut = allPlayers.find((p) => p.id === transfer.element_out);
              return (
                <div
                  key={`${transfer.entry}-${transfer.event}-${transfer.time}`}
                  className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">IN</p>
                    <p className="text-emerald-400 font-semibold text-sm">
                      {playerIn?.web_name ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">OUT</p>
                    <p className="text-red-400 font-semibold text-sm">
                      {playerOut?.web_name ?? 'Unknown'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
