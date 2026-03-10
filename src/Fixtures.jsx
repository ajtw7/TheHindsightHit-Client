import { useContext, useState, useMemo } from 'react';
import useFixtures from './services/useFixtures';
import { PlayerContext } from './services/context';
import { FPL_TEAMS } from './utils/teams';

export default function Fixtures() {
  const fixtures = useFixtures();
  const { currentGW } = useContext(PlayerContext);
  const [selectedGW, setSelectedGW] = useState(null);

  const availableGWs = useMemo(
    () => [...new Set(fixtures.map((f) => f.event))].sort((a, b) => a - b),
    [fixtures]
  );

  // Default to currentGW; fall back to first available GW in list
  const effectiveGW = selectedGW ?? currentGW?.id ?? availableGWs[0];

  const filteredFixtures = useMemo(
    () => fixtures.filter((f) => f.event === effectiveGW),
    [fixtures, effectiveGW]
  );

  const teamName = (id) => FPL_TEAMS[id] ?? `Team ${id}`;

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Fixtures</h1>

      <select
        value={effectiveGW ?? ''}
        onChange={(e) => setSelectedGW(Number(e.target.value))}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 mb-5 focus:outline-none focus:border-emerald-400"
      >
        {availableGWs.map((gw) => (
          <option key={gw} value={gw}>
            GW {gw}
          </option>
        ))}
      </select>

      {filteredFixtures.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">
          No fixtures for this gameweek.
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredFixtures.map((fixture) => (
            <li
              key={fixture.id}
              className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-4 flex items-center"
            >
              <span className="flex-1 text-white font-semibold text-sm text-right pr-4">
                {teamName(fixture.team_h)}
              </span>
              <span className="text-slate-500 text-xs font-bold px-3 py-1 bg-slate-700 rounded-full whitespace-nowrap">
                vs
              </span>
              <span className="flex-1 text-white font-semibold text-sm text-left pl-4">
                {teamName(fixture.team_a)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
