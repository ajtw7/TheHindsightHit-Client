import { useEffect, useState, useContext } from 'react';
import { PlayerContext } from './services/context';

export default function GWHistory({ gwHistory, playerHistories, myPlayers }) {
  const { currentGW } = useContext(PlayerContext);

  const [uniquePlayerHistories, setUniquePlayerHistories] = useState([]);

  const [selectedGW, setSelectedGW] = useState(currentGW);

  // filter the transfers by the current gameweek
  // function filterTransfersByGW(transfers, currentGW) {
  //   return transfers.filter((transfer) => transfer.event === currentGW);
  // }

  // get the transfers for the current gameweek
  // const myGWTransfers = filterTransfersByGW(myTransfers, currentGW);

  // ensures player GW histories are unique on mount and when playerHistories changes
  useEffect(() => {
    console.log('running useEffect');
    let newUniquePH = [];
    for (let pH of playerHistories) {
      let uniqueGWData = [];
      let seenRounds = new Set();
      for (let gwData of pH) {
        if (!seenRounds.has(gwData.round)) {
          seenRounds.add(gwData.round);
          uniqueGWData.push(gwData);
        }
      }
      newUniquePH.push(uniqueGWData);
    }
    setUniquePlayerHistories(newUniquePH);
  }, [playerHistories]);

  // console log all deconstructed variables
  // console.log('GWHistory Log:', {
  //   myGWTransfers,
  // });

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
        <div>
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
            {/* {myGWTransfers
              .filter((transfer) => transfer.event === selectedGW)
              .map((transfer, index) => {
                const playerIn = myPlayers.find(
                  (player) => player.id === transfer.element_in
                );

                const playerOut = myPlayers.find(
                  (player) => player.id === transfer.element_out
                );
                console.log('players & transfers', {
                  myPlayers,
                  myGWTransfers,
                });
                return (
                  <div key={index} style={{ padding: 10 }}>
                    <p>Player In: {playerIn ? playerIn.web_name : 'Unknown'}</p>
                    <p>
                      Player Out: {playerOut ? playerOut.web_name : 'Unknown'}
                    </p>
                    <p>GW: {transfer.event}</p>
                  </div>
                );
              })} */}
          </div>
        </div>
      </div>
    </div>
  );
}
// Path: src/GWHistory.js
