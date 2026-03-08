import { useEffect, useState, useContext, useMemo } from 'react';
import { PlayerContext } from './services/context';
import { DataGrid } from '@mui/x-data-grid';
import { transferColumnDef } from './transferColumnDef';
import { findAlternatives } from './utils/findAlternatives';

export default function Transfers({ myTransfers }) {
  const [enhancedTransfers, setEnhancedTransfers] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const { allPlayers, uniquePlayerHistories } = useContext(PlayerContext);

  const playerLookup = useMemo(
    () => allPlayers.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [allPlayers]
  );

  useEffect(() => {
    if (!myTransfers.length || !uniquePlayerHistories.length) return;

    setEnhancedTransfers(
      myTransfers.map((transfer) => ({
        ...transfer,
        element_in: playerLookup[transfer.element_in]?.web_name ?? transfer.element_in,
        element_out: playerLookup[transfer.element_out]?.web_name ?? transfer.element_out,
        alternatives: findAlternatives(transfer, transfer.event, uniquePlayerHistories),
      }))
    );
  }, [myTransfers, uniquePlayerHistories, playerLookup]);

  const columns = useMemo(() => transferColumnDef(setSelectedRow), []);

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Transfers</h1>
      <p className="text-slate-400 text-sm mb-4">
        Tap <span className="text-emerald-400 font-medium">Show Alternatives</span> on
        any row to see who you could have bought instead.
      </p>

      <div className="transfers-grid overflow-x-auto rounded-xl border border-slate-700">
        <DataGrid
          rows={enhancedTransfers}
          columns={columns}
          columnVisibilityModel={{ time: false, entry: false }}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          getRowId={(row) => `${row.entry}-${row.event}-${row.time}`}
          autoHeight
        />
      </div>

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
              You transferred in{' '}
              <span className="text-white font-semibold">{selectedRow.element_in}</span>
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
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-sm">
                        {alt.total_points} pts
                      </span>
                      <span className="text-slate-400 text-xs ml-2">
                        £{(alt.value / 10).toFixed(1)}m
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
