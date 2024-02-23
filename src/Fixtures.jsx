import React from 'react';
import useFixtures from './services/useFixtures';

export default function Fixtures() {
  const fixtures = useFixtures();

  return (
    <div>
      <h1>Fixtures</h1>
      <ul>
        {fixtures.map((fixture) => (
          <li key={fixture.id}>
            <p>
              {fixture.team_a} vs {fixture.team_h}
            </p>
            <p>Event: {fixture.event}</p>
            <p>Deadline Time: {fixture.deadline_time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
