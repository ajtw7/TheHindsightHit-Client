/**
 * Given a transfer and the full pool of unique player histories, returns players
 * who scored MORE points than the transferred-in player in that gameweek at the
 * SAME OR LOWER cost (as recorded at the time of the transfer).
 *
 * @param {{ element_in: number, element_in_cost: number }} transfer
 * @param {number} gameweek
 * @param {Array<Array<{ element: number, round: number, total_points: number, value: number }>>} uniquePlayerHistories
 * @returns {Array<{ element: number, round: number, total_points: number, value: number }>}
 */
export function findAlternatives(transfer, gameweek, uniquePlayerHistories) {
  const playerInHistory = uniquePlayerHistories.find(
    (ph) => ph[0]?.element === transfer.element_in
  );
  if (!playerInHistory) return [];

  const playerInGWHistory = playerInHistory.find((h) => h.round === gameweek);
  const playerInTotalPoints = playerInGWHistory?.total_points ?? null;
  if (playerInTotalPoints === null) return [];

  return uniquePlayerHistories.flatMap((ph) =>
    ph.filter(
      (h) =>
        h.round === gameweek &&
        h.total_points > playerInTotalPoints &&
        h.value <= transfer.element_in_cost
    )
  );
}
