import { useEffect, useState, useContext, useMemo } from 'react';
import { PlayerContext } from './services/context';
import { DataGrid } from '@mui/x-data-grid';
import { transferColumnDef } from './transferColumnDef';

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

    const findAlternatives = (transfer, gameweek) => {
      const playerInHistory = uniquePlayerHistories.find(
        (ph) => ph[0]?.element === transfer.element_in
      );
      if (!playerInHistory) return [];

      const playerInGWHistory = playerInHistory.find((h) => h.round === gameweek);
      const playerInTotalPoints = playerInGWHistory?.total_points ?? null;
      if (playerInTotalPoints === null) return [];

      return uniquePlayerHistories.flatMap((ph) =>
        ph.filter(
          (h) =>
            h.round === gameweek &&
            h.total_points > playerInTotalPoints &&
            h.value <= transfer.element_in_cost
        )
      );
    };

    setEnhancedTransfers(
      myTransfers.map((transfer) => ({
        ...transfer,
        element_in: playerLookup[transfer.element_in]?.web_name ?? transfer.element_in,
        element_out: playerLookup[transfer.element_out]?.web_name ?? transfer.element_out,
        alternatives: findAlternatives(transfer, transfer.event),
      }))
    );
  }, [myTransfers, uniquePlayerHistories, playerLookup]);

  const columns = useMemo(() => transferColumnDef(setSelectedRow), []);

  return (
    <div style={{ height: 'auto', width: '100%' }}>
      <h1>Transfers</h1>
      <DataGrid
        rows={enhancedTransfers}
        columns={columns}
        columnVisibilityModel={{ time: false, entry: false }}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        getRowId={(row) => `${row.entry}-${row.event}-${row.time}`}
      />

      {selectedRow && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRow(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Alternatives for GW{selectedRow.event}</h2>
            <p>
              You transferred in: <strong>{selectedRow.element_in}</strong>
            </p>
            {selectedRow.alternatives.length === 0 ? (
              <p>No better alternatives available within budget.</p>
            ) : (
              <ul style={{ paddingLeft: 20 }}>
                {selectedRow.alternatives.map((alt) => (
                  <li key={alt.element}>
                    {playerLookup[alt.element]?.web_name ?? `Player ${alt.element}`}
                    {' — '}
                    {alt.total_points} pts @ £{(alt.value / 10).toFixed(1)}m
                  </li>
                ))}
              </ul>
            )}
            <button
              style={{ marginTop: 16 }}
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
