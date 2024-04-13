import { useContext } from 'react';
import { PlayerContext } from './services/context';
import { DataGrid } from '@mui/x-data-grid';
import { transferColumnDef } from './transferColumnDef';

export default function Transfers(myTransfers) {
  const { allPlayers } = useContext(PlayerContext);
  const myTransfersArray = Object.values(myTransfers);
  const [transfers] = myTransfersArray;

  const playerLookup = allPlayers.reduce((lookup, player) => {
    lookup[player.id] = player.web_name;
    return lookup;
  }, {});

  const namedTransfers = transfers.map((transfer) => ({
    ...transfer,
    element_in: playerLookup[transfer.element_in],
    element_out: playerLookup[transfer.element_out],
  }));

  // const findAlternatives(player, allPlayers) => {
  //   return allPlayers.filter(
  //     altPlayer => altPlayer
  //   )

  return (
    <div style={{ height: 'auto', width: '100%' }}>
      <h1>Transfers</h1>
      <DataGrid
        rows={namedTransfers}
        columns={transferColumnDef}
        columnVisibilityModel={{
          time: false,
          entry: false,
        }}
        pageSize={5}
        getRowId={(row) => `${row.entry}-${row.event}-${row.time}`}
      />
    </div>
  );
}
