import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { PlayerContext } from './services/context';
import { DataGrid } from '@mui/x-data-grid';
import { transferColumnDef } from './transferColumnDef';
import usePlayerHistories from './services/usePlayerHistories';
import { useManageUniquePlayerHistories } from './services/useManageUniquePlayerHistories';

export default function Transfers(myTransfers) {
  const [isLoading, setIsLoading] = useState(true);
  const [enhancedTransfers, setEnhancedTransfers] = useState([]);
  const { allPlayers } = useContext(PlayerContext);
  const allPlayerIds = allPlayers.map((player) => player.id);
  const allPlayerHistories = usePlayerHistories(allPlayerIds);
  const myTransfersArray = Object.values(myTransfers);
  const [transfers] = myTransfersArray;
  const [uniquePlayerHistories] =
    useManageUniquePlayerHistories(allPlayerHistories);

  useEffect(() => {
    const playerLookup = allPlayers.reduce((lookup, player) => {
      lookup[player.id] = player.web_name;
      return lookup;
    }, {});

    const findAlternatives = (transfer, gameweek) => {
      console.log('alt trans & gw', { transfer, gameweek });
      const playerInHistory = uniquePlayerHistories.find(
        (playerHistory) => playerHistory[0].element === transfer.element_in
      );

      if (!playerInHistory) {
        console.error('Player not found in history', transfer.element_in);
        return [];
      }

      const playerInGWHistory = playerInHistory.find(
        (history) => history.round === gameweek
      );

      const playerInTotalPoints = playerInGWHistory.total_points;

      return uniquePlayerHistories.flatMap((playerHistories) => {
        const filteredByRound = playerHistories.filter((history) => {
          const isSameRound = history.round === gameweek;
          return isSameRound;
        });

        const filteredByPointsAndPrice = filteredByRound.filter((history) => {
          const isBetterPlayer =
            history.total_points > playerInTotalPoints &&
            history.value <= transfer.element_in_cost;
          return isBetterPlayer;
        });
        return filteredByPointsAndPrice;
      });
    };

    const newEnhancedTransfers = transfers.map((transfer) => {
      const alternatives = findAlternatives(transfer, transfer.event);
      return {
        ...transfer,
        element_in: playerLookup[transfer.element_in],
        element_out: playerLookup[transfer.element_out],
        alternatives,
      };
    });
    setEnhancedTransfers(newEnhancedTransfers);
    setIsLoading(false);
  }, [transfers, allPlayers, uniquePlayerHistories, allPlayerHistories]);

  return (
    <div style={{ height: 'auto', width: '100%' }}>
      <h1>Transfers</h1>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <DataGrid
          rows={enhancedTransfers}
          columns={transferColumnDef}
          columnVisibilityModel={{
            time: false,
            entry: false,
          }}
          pageSize={5}
          getRowId={(row) => `${row.entry}-${row.event}-${row.time}`}
        />
      )}
    </div>
  );
}
