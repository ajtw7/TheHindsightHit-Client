import { useEffect, useState, useContext, useMemo } from 'react';
import { PlayerContext } from './services/context';
import { findAlternatives } from './utils/findAlternatives';

export default function Transfers({ myTransfers }) {
  const [enhancedTransfers, setEnhancedTransfers] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedGW, setSelectedGW] = useState(null);
  const { allPlayers, uniquePlayerHistories } = useContext(PlayerContext);

  const playerLookup = useMemo(
    () => allPlayers.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [allPlayers]
  );

  useEffect(() => {
    if (!myTransfers.length) return;

    setEnhancedTransfers(
      myTransfers.map((transfer) => ({
        ...transfer,
        playerIn: playerLookup[transfer.element_in] ?? { web_name: `#${transfer.element_in}` },
        playerOut: playerLookup[transfer.element_out] ?? { web_name: `#${transfer.element_out}` },
        alternatives: uniquePlayerHistories.length
          ? findAlternatives(transfer, transfer.event, uniquePlayerHistories)
              .sort((a, b) => b.total_points - a.total_points)
          : null,
      }))
    );
  }, [myTransfers, uniquePlayerHistories, playerLookup]);

  const availableGWs = useMemo(
    () => [...new Set(myTransfers.map((t) => t.event))].sort((a, b) => b - a),
    [myTransfers]
  );

  const filteredTransfers = useMemo(
    () =>
      selectedGW == null
        ? enhancedTransfers
        : enhancedTransfers.filter((t) => t.event === selectedGW),
    [enhancedTransfers, selectedGW]
  );

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Transfers</h1>
      <p className="text-slate-400 text-sm mb-5">
        Tap <span className="text-emerald-400 font-medium">Show Alternatives</span> to
        see who you could have bought instead.
      </p>

      {/* GW filter */}
      <select
        value={selectedGW ?? ''}
        onChange={(e) =>
          setSelectedGW(e.target.value ? Number(e.target.value) : null)
        }
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 mb-5 focus:outline-none focus:border-emerald-400"
      >
        <option value="">All Gameweeks</option>
        {availableGWs.map((gw) => (
          <option key={gw} value={gw}>
            GW {gw}
          </option>
        ))}
      </select>

      {filteredTransfers.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">
          No transfers for this gameweek.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTransfers.map((transfer) => (
            <div
              key={`${transfer.entry}-${transfer.event}-${transfer.time}`}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-4"
            >
              {/* GW badge + date */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                  GW {transfer.event}
                </span>
                <span className="text-slate-500 text-xs">
                  {new Date(transfer.time).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Player in / out */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    In
                  </p>
                  <p className="text-emerald-400 font-bold text-sm leading-snug">
                    {transfer.playerIn.web_name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    £{(transfer.element_in_cost / 10).toFixed(1)}m
                    {transfer.playerIn.now_cost != null && transfer.playerIn.now_cost !== transfer.element_in_cost && (
                      <>
                        {' → '}£{(transfer.playerIn.now_cost / 10).toFixed(1)}m{' '}
                        <span className={transfer.playerIn.now_cost > transfer.element_in_cost ? 'text-emerald-400' : 'text-red-400'}>
                          {transfer.playerIn.now_cost > transfer.element_in_cost ? '+' : '-'}£{(Math.abs(transfer.playerIn.now_cost - transfer.element_in_cost) / 10).toFixed(1)}m
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Out
                  </p>
                  <p className="text-red-400 font-bold text-sm leading-snug">
                    {transfer.playerOut.web_name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    £{(transfer.element_out_cost / 10).toFixed(1)}m
                    {transfer.playerOut.now_cost != null && transfer.playerOut.now_cost !== transfer.element_out_cost && (
                      <>
                        {' → '}£{(transfer.playerOut.now_cost / 10).toFixed(1)}m{' '}
                        <span className={transfer.playerOut.now_cost > transfer.element_out_cost ? 'text-emerald-400' : 'text-red-400'}>
                          {transfer.playerOut.now_cost > transfer.element_out_cost ? '+' : '-'}£{(Math.abs(transfer.playerOut.now_cost - transfer.element_out_cost) / 10).toFixed(1)}m
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Show Alternatives button */}
              <button
                onClick={() => transfer.alternatives !== null && setSelectedRow(transfer)}
                disabled={transfer.alternatives === null}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  transfer.alternatives === null
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : transfer.alternatives.length > 0
                    ? 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {transfer.alternatives === null
                  ? 'Loading alternatives…'
                  : transfer.alternatives.length > 0
                  ? `Show ${transfer.alternatives.length} Alternative${
                      transfer.alternatives.length !== 1 ? 's' : ''
                    }`
                  : 'No Better Alternatives Found'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alternatives bottom-sheet modal */}
      {selectedRow && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 px-4 pb-6"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                GW{selectedRow.event} Alternatives
              </h2>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                {selectedRow.alternatives.length} found
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              You brought in{' '}
              <span className="text-white font-semibold">
                {selectedRow.playerIn.web_name}
              </span>{' '}
              — these players scored more at the same or lower cost:
            </p>

            {selectedRow.alternatives.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">
                  No better alternatives available within budget.
                </p>
                <p className="text-slate-500 text-xs mt-1">Solid pick!</p>
              </div>
            ) : (
              <ul className="space-y-2 mb-5">
                {selectedRow.alternatives.map((alt) => (
                  <li
                    key={alt.element}
                    className="flex justify-between items-center bg-slate-700 rounded-xl px-4 py-3"
                  >
                    <span className="text-white font-medium text-sm">
                      {playerLookup[alt.element]?.web_name ?? `Player ${alt.element}`}
                    </span>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-emerald-400 font-bold text-sm">
                        {alt.total_points} pts
                      </span>
                      <span className="text-slate-400 text-xs ml-2">
                        £{(alt.value / 10).toFixed(1)}m
                        {(() => {
                          const nowCost = playerLookup[alt.element]?.now_cost;
                          if (nowCost == null || nowCost === alt.value) return null;
                          const diff = nowCost - alt.value;
                          return (
                            <>
                              {' → '}£{(nowCost / 10).toFixed(1)}m{' '}
                              <span className={diff > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {diff > 0 ? '+' : '-'}£{(Math.abs(diff) / 10).toFixed(1)}m
                              </span>
                            </>
                          );
                        })()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl py-3 font-semibold transition-colors"
              onClick={() => setSelectedRow(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
