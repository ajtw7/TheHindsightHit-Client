import { useContext, useState } from 'react';
import { PlayerContext } from './services/context';

const POSITION_MAP = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

const StatCard = ({ label, value, accent = false }) => (
  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className={`text-xl font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}>
      {value ?? '—'}
    </p>
  </div>
);

function PlayerCard({ player, onClick }) {
  const pos = POSITION_MAP[player.element_type] ?? '?';
  return (
    <button
      onClick={() => onClick(player)}
      className="bg-slate-800 rounded-xl border border-slate-700 px-2 py-3 text-center hover:border-emerald-500 active:bg-slate-700 transition-colors w-full cursor-pointer"
    >
      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">{pos}</p>
      <p className="text-white text-sm font-medium truncate">{player.web_name}</p>
      <p className="text-emerald-400 text-xs font-semibold mt-1">{player.total_points} pts</p>
    </button>
  );
}

function PlayerModal({ player, teamLookup, onClose }) {
  const teamName = teamLookup[player.team]?.name ?? `Team ${player.team}`;
  const pos = POSITION_MAP[player.element_type] ?? '—';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-400 bg-emerald-400/10 rounded px-2 py-0.5">
              {pos}
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              {player.first_name} {player.second_name}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{teamName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none ml-4 mt-1 flex-shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/60 rounded-xl p-3">
            <p className="text-xs text-slate-400 uppercase mb-1">Total Points</p>
            <p className="text-emerald-400 font-bold text-2xl">{player.total_points}</p>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3">
            <p className="text-xs text-slate-400 uppercase mb-1">Price</p>
            <p className="text-white font-bold text-2xl">
              £{(player.now_cost / 10).toFixed(1)}m
            </p>
          </div>
          {player.squad_number != null && (
            <div className="bg-slate-700/60 rounded-xl p-3">
              <p className="text-xs text-slate-400 uppercase mb-1">Jersey</p>
              <p className="text-white font-semibold text-xl">#{player.squad_number}</p>
            </div>
          )}
          {player.nationality && (
            <div className="bg-slate-700/60 rounded-xl p-3">
              <p className="text-xs text-slate-400 uppercase mb-1">Nationality</p>
              <p className="text-white font-semibold text-sm">{player.nationality}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManagerProfile({ myPlayers }) {
  const { mgrData, teams } = useContext(PlayerContext);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const teamLookup = teams.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});

  const {
    id,
    name,
    player_first_name,
    player_last_name,
    current_event,
    summary_overall_points,
    summary_overall_rank,
    summary_event_points,
    summary_event_rank,
    last_deadline_bank,
    last_deadline_value,
    last_deadline_total_transfers,
  } = mgrData;

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const starters = myPlayers
    .filter((p) => p.squadPosition != null && p.squadPosition <= 11)
    .sort((a, b) => a.squadPosition - b.squadPosition);

  const bench = myPlayers
    .filter((p) => p.squadPosition != null && p.squadPosition > 11)
    .sort((a, b) => a.squadPosition - b.squadPosition);

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-5xl mx-auto">
      {/* Manager header */}
      <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
      <p className="text-slate-400 text-sm mb-6">
        {player_first_name} {player_last_name} &middot; Team #{id}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Overall Points" value={summary_overall_points} />
        <StatCard
          label="Overall Rank"
          value={summary_overall_rank?.toLocaleString()}
        />
        <StatCard
          label={`GW${current_event} Points`}
          value={summary_event_points}
          accent
        />
        <StatCard
          label={`GW${current_event} Rank`}
          value={summary_event_rank?.toLocaleString()}
        />
        <StatCard
          label="Team Value"
          value={`£${(last_deadline_value / 10).toFixed(1)}m`}
        />
        <StatCard
          label="In the Bank"
          value={`£${(last_deadline_bank / 10).toFixed(1)}m`}
        />
        <StatCard label="Total Transfers" value={last_deadline_total_transfers} />
      </div>

      {/* Starting XI */}
      <h2 className="text-lg font-semibold text-white mb-3">Starting XI</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
        {starters.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={setSelectedPlayer} />
        ))}
      </div>

      {/* Bench */}
      <h2 className="text-base font-semibold text-slate-400 mb-3 mt-5">Bench</h2>
      <div className="grid grid-cols-4 gap-2">
        {bench.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={setSelectedPlayer} />
        ))}
      </div>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          teamLookup={teamLookup}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
