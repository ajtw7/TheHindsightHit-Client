import { useContext } from 'react';
import { PlayerContext } from './services/context';

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

export default function ManagerProfile({ myPlayers }) {
  const { mgrData } = useContext(PlayerContext);

  const {
    id,
    name,
    favourite_team,
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

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
      <p className="text-slate-400 text-sm mb-6">
        {player_first_name} {player_last_name} &middot; Team #{id}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
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
        <StatCard label="Fav. Team" value={favourite_team} />
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">Current Squad</h2>
      <div className="grid grid-cols-3 gap-2">
        {myPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-slate-800 rounded-xl border border-slate-700 px-3 py-3 text-center"
          >
            <p className="text-white text-sm font-medium truncate">{player.web_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
