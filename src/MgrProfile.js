import { useEffect, useState } from 'react';

export default function MgrProfile() {
  const [mgrData, setMgrData] = useState({});
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/mgr-profile/');
        const data = await res.json();
        setMgrData((tempMgrData) => {
          return data;
        });
        console.log('this is the mgr data', mgrData);
      } catch (error) {
        console.error('this is the mgr data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
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
  );
}
