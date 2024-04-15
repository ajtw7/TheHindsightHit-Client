import { useEffect, useState, useContext } from 'react';
import { SelectedGWContext, PlayerContext } from './services/context';
import usePlayerHistories from './services/usePlayerHistories';
import { useManageUniquePlayerHistories } from './services/useManageUniquePlayerHistories';

export default function GWHistory({ gwHistory, myPlayers, setSelectedGW, myTransfers }) {
  const { selectedGW } = useContext(SelectedGWContext);
  const { allPlayers, myPlayerIds } = useContext(PlayerContext);

  // const [currentTeam, setCurrentTeam] = useState([]);
  const [gwHistories, setGWHistories] = useState({});

  // // filter the transfers by the current gameweek
  const selectedGWTransfers = myTransfers.filter(
    (transfer) => transfer.event === selectedGW
  );
  const playerHistories = usePlayerHistories(myPlayerIds);
  const [uniquePlayerHistories] =
    useManageUniquePlayerHistories(playerHistories);

  // ensures player GW histories are unique on mount and when playerHistories changes
  useEffect(() => {
    setGWHistories((prev) => ({
      ...prev,
      [selectedGW]: uniquePlayerHistories,
    }));
  }, [uniquePlayerHistories, selectedGW]);

  // handle the change of the gameweek dropdown
  function handleGWChange(gw) {
    console.log('GW Change:', gw);
    setSelectedGW(gw);
  }
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        padding: 20,
      }}
    >
      {/* Dropdown to select the game week */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <select
          id="gw-select"
          value={selectedGW}
          onChange={(e) => handleGWChange(Number(e.target.value))}
        >
          {gwHistory.map((gw) => (
            <option key={gw.id} value={gw.event}>
              GW: {gw.event}
            </option>
          ))}
        </select>
      </div>

      {/* Filer the displayed gameweek history based on the selected gameweek */}
      <>
        {gwHistory
          .filter((gw) => gw.event === selectedGW)
          .map((gw) => (
            <div key={gw.event} style={{ padding: 10 }}>
              <p>GW: {gw.event}</p>
              <p>Points: {gw.points}</p>
              <br />
            </div>
          ))}
      </>

      {/* Display the player history for the selected gameweek */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'center',
            width: '50%',
            height: 'auto',
            margin: 'auto',
          }}
        >
          {uniquePlayerHistories.map((playerHistory) =>
            playerHistory
              .filter((gwData) => gwData.round === selectedGW)
              .map((gwData) => {
                const player = myPlayers.find(
                  (player) => player.id === gwData.element
                );
                if (!player) {
                  console.log('No player found with id:', gwData.element);
                  return null; // Return null to avoid rendering anything for this player
                }
                return (
                  <div
                    key={`${gwData.element}-${gwData.round}-${player.web_name}`}
                    style={{ padding: 10 }}
                  >
                    <p>Player: {player.web_name}</p>
                    <p>Team: {player.team}</p>
                    <p>Points: {gwData.total_points}</p>
                    <p>Minutes: {gwData.minutes}</p>
                    <p>Goals Scored: {gwData.goals_scored}</p>
                  </div>
                );
              })
          )}
        </div>
        <div style={{ margin: 10 }}>
          <h1>Transfers</h1>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignContent: 'center',
              width: '100%',
              height: 'auto',
              margin: 'auto',
              backgroundColor: 'lightgray',
            }}
          >
            {selectedGWTransfers.map((transfer) => {
              const playerIn = myPlayers.find(
                (player) => player.id === transfer.element_in
              );
              const playerOut = allPlayers.find(
                (player) => player.id === transfer.element_out
              );
              return (
                <div
                  key={`${transfer.entry}-${transfer.event}-${transfer.time}`}
                  style={{ padding: 10 }}
                >
                  <p>In: {playerIn ? playerIn.web_name : 'Unknown Player'}</p>
                  <p>
                    Out: {playerOut ? playerOut.web_name : 'Unknown Player'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
// Path: src/GWHistory.js
