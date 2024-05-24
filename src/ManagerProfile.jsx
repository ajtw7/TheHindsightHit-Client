import { useContext } from 'react';
import { PlayerContext } from './services/context';

export default function ManagerProfile({ myPlayers }) {
  const { mgrData } = useContext(PlayerContext);

  

  const {
    id,
    name,
    favourite_team,
    player_first_name,
    player_last_name,
    current_event,
    summary_overall_points,
    summary_overall_rank,
    summary_event_points,
    summary_event_rank,
    last_deadline_bank,
    last_deadline_value,
    last_deadline_total_transfers,
  } = mgrData;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-evenly',
        justifyItems: 'center',
        padding: 20,
      }}
    >
      <div style={{ textAlign: 'left', minWidth: '50%' }}>
        <p>Team Id: {id}</p>
        <p>Team Name: {name}</p>
        <p>Player First Name: {player_first_name}</p>
        <p>Player Last Name: {player_last_name}</p>
        <p>Current GW: {current_event}</p>
        <p>Overall Points: {summary_overall_points}</p>
        <p>Overall Rank: {summary_overall_rank}</p>
        <p>GW Total Points: {summary_event_points}</p>
        <p>GW Total Rank: {summary_event_rank}</p>
        <p>Team Value: {last_deadline_value}</p>
        <p>Budget: {last_deadline_bank}</p>
        <p>Total Number of Transfers: {last_deadline_total_transfers}</p>
        <p>Favorite Team: {favourite_team}</p>
      </div>
      <div>
        <h1>Current Gameweek Team</h1>
        <div
          style={{
            display: ' flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            justifyItems: 'center',
            padding: 20,
          }}
        >
          {myPlayers.map((player) => (
            <div key={player.id} style={{ width: '25%', padding: 20 }}>
              <p>{player.web_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
