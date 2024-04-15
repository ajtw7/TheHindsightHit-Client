import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { PlayerContext } from './services/context';
import { DataGrid } from '@mui/x-data-grid';
import { transferColumnDef } from './transferColumnDef';
import usePlayerHistories from './services/usePlayerHistories';
import { useManageUniquePlayerHistories } from './services/useManageUniquePlayerHistories';

export default function Transfers(myTransfers) {
  const [isLoading, setIsLoading] = useState(true);
  const { allPlayers } = useContext(PlayerContext);
  const myTransfersArray = Object.values(myTransfers);
  const [transfers] = myTransfersArray;
  const allPlayerIds = allPlayers.map((player) => player.id);
  const allPlayerHistories = usePlayerHistories(allPlayerIds);
  const [uniquePlayerHistories] =
    useManageUniquePlayerHistories(allPlayerHistories);
  const [enhancedTransfers, setEnhancedTransfers] = useState([]);

  useEffect(() => {
    const playerLookup = allPlayers.reduce((lookup, player) => {
      lookup[player.id] = player.web_name;
      return lookup;
    }, {});

    // console.log('apl', allPlayerHistories);

    const findAlternatives = (transfer, gameweek) => {
      console.log('alt trans & gw', { transfer, gameweek });
      const playerInHistory = uniquePlayerHistories.find(
        (playerHistory) => playerHistory[0].element === transfer.element_in
      );

      // console.log('playerInHistory', playerInHistory);

      if (!playerInHistory) {
        console.error('Player not found in history', transfer.element_in);
        return [];
      }

      const playerInGWHistory = playerInHistory.find(
        (history) => history.round === gameweek
      );

      const playerInTotalPoints = playerInGWHistory.total_points;
      // console.log('playerInTotalPoints', playerInTotalPoints);

      return uniquePlayerHistories.flatMap((playerHistories) => {
        const filteredByRound = playerHistories.filter((history) => {
          const isSameRound = history.round === gameweek;
          // console.log('Is same round:', isSameRound, 'History:', history);
          return isSameRound;
        });

        const filteredByPointsAndPrice = filteredByRound.filter((history) => {
          const isBetterPlayer =
            history.total_points > playerInTotalPoints &&
            history.value <= transfer.element_in_cost;
          // console.log('Is better player:', isBetterPlayer, 'History:', history);
          return isBetterPlayer;
        });
        // console.log('filteredByPointsAndPrice', filteredByPointsAndPrice);
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

  console.log('enhancedransfers', enhancedTransfers);

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
