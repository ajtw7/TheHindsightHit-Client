// useManageUniquePlayerHistories.js
import { useEffect, useState } from 'react';

export function useManageUniquePlayerHistories(playerHistories) {
  const [uniquePlayerHistories, setUniquePlayerHistories] = useState([]);

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

  return [uniquePlayerHistories, setUniquePlayerHistories];
}
