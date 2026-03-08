import React from 'react';
import useFixtures from './services/useFixtures';

export default function Fixtures() {
  const fixtures = useFixtures();

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Fixtures</h1>
      <ul className="space-y-2">
        {fixtures.map((fixture) => (
          <li
            key={fixture.id}
            className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 flex justify-between items-center"
          >
            <span className="text-white font-medium text-sm">
              {fixture.team_a} vs {fixture.team_h}
            </span>
            <span className="text-emerald-400 text-xs font-semibold">
              GW{fixture.event}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
