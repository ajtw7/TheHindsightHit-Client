import { useContext, useEffect, useState } from 'react';
import useGWHistory from './services/useGWHistory';
import { PlayerContext } from './App';

export default function GWHistory() {
  const gwHistory = useGWHistory();
  const { mgrData, myPlayerIds, myPlayers, playerHistories } =
    useContext(PlayerContext);

  //  Rename current_event to currentEvent
  const { current_event: currentEvent } = mgrData;

  // Use currentEvent as the default value for currentGW
  const [currentGW, setCurrentGW] = useState(currentEvent);
  const [uniquePlayerHistories, setUniquePlayerHistories] = useState([]);

  // ensure the current gameweek is always see
  useEffect(() => {
    setCurrentGW(currentEvent);
  }, [currentEvent]);

  // ensures player GW histories are unique on mount and when playerHistories changes
  useEffect(() => {
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
  console.log('GWHistory Log:', {
    playerHistories,
    myPlayerIds,
    myPlayers,
    mgrData,
    gwHistory,
  });

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
          value={currentGW}
          onChange={(e) => setCurrentGW(Number(e.target.value))}
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
          .filter((gw) => gw.event === currentGW)
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
            .filter((gwData) => gwData.round === currentGW)
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
      </div>
    </div>
  );
}
// Path: src/GWHistory.js
