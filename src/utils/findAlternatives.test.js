import { findAlternatives } from './findAlternatives';

// ─── helpers ────────────────────────────────────────────────────────────────

const entry = (element, round, total_points, value) => ({
  element,
  round,
  total_points,
  value,
});

const transfer = (element_in, element_in_cost) => ({ element_in, element_in_cost });

// ─── tests ───────────────────────────────────────────────────────────────────

describe('findAlternatives', () => {
  const GW = 5;

  // Baseline: the manager transferred in player 10 at cost 80, who scored 3 pts in GW5
  const playerA_history = [entry(10, GW, 3, 80)];

  // ── cannot locate transferred-in player ───────────────────────────────────

  describe('when the transferred-in player cannot be found', () => {
    it('returns [] when uniquePlayerHistories is empty', () => {
      expect(findAlternatives(transfer(10, 80), GW, [])).toEqual([]);
    });

    it('returns [] when the player ID is not in any history', () => {
      const histories = [[entry(99, GW, 10, 80)]];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });

    it('returns [] when the player has no entry for the specified gameweek', () => {
      // player 10 only has GW4, not GW5
      const histories = [[entry(10, 4, 10, 80)]];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });

    it('returns [] when the player history array is empty', () => {
      const histories = [[]]; // player with no rounds at all
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });
  });

  // ── no qualifying alternatives ─────────────────────────────────────────────

  describe('when no alternative qualifies', () => {
    it('returns [] when every other player scored the same points (not strictly greater)', () => {
      const histories = [playerA_history, [entry(20, GW, 3, 70)]];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });

    it('returns [] when every other player scored fewer points', () => {
      const histories = [
        playerA_history,
        [entry(20, GW, 2, 70)],
        [entry(30, GW, 0, 60)],
      ];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });

    it('returns [] when a better player exists but costs more than the transferred-in player', () => {
      const histories = [
        playerA_history, // element 10, cost 80
        [entry(20, GW, 12, 90)], // better points, but cost 90 > 80
      ];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toEqual([]);
    });

    it('returns [] when only the transferred-in player is in the pool', () => {
      expect(findAlternatives(transfer(10, 80), GW, [playerA_history])).toEqual([]);
    });
  });

  // ── single qualifying alternative ─────────────────────────────────────────

  describe('when one alternative qualifies', () => {
    it('returns a player who scored more and costs less', () => {
      const histories = [playerA_history, [entry(20, GW, 8, 75)]];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ element: 20, total_points: 8, value: 75 });
    });

    it('includes a player at exactly the same cost as the transferred-in player', () => {
      const histories = [playerA_history, [entry(20, GW, 7, 80)]]; // cost == 80
      const result = findAlternatives(transfer(10, 80), GW, histories);
      expect(result).toHaveLength(1);
      expect(result[0].element).toBe(20);
    });

    it('does not include the transferred-in player themselves', () => {
      // Only player 10 in the pool — cannot be their own alternative
      const result = findAlternatives(transfer(10, 80), GW, [playerA_history]);
      expect(result).toHaveLength(0);
    });
  });

  // ── multiple qualifying alternatives ──────────────────────────────────────

  describe('when multiple alternatives qualify', () => {
    it('returns all players who scored more within budget', () => {
      const histories = [
        playerA_history,       // 3 pts, cost 80
        [entry(20, GW, 8, 75)], // ✓ better, affordable
        [entry(30, GW, 6, 80)], // ✓ better, at exact same cost
        [entry(40, GW, 5, 70)], // ✓ better, cheaper
        [entry(50, GW, 3, 65)], // ✗ same points
        [entry(60, GW, 10, 90)], // ✗ better but over budget
      ];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      const elements = result.map((r) => r.element);
      expect(elements).toHaveLength(3);
      expect(elements).toContain(20);
      expect(elements).toContain(30);
      expect(elements).toContain(40);
      expect(elements).not.toContain(50);
      expect(elements).not.toContain(60);
    });
  });

  // ── gameweek filtering ─────────────────────────────────────────────────────

  describe('gameweek filtering', () => {
    it('only considers entries from the specified gameweek', () => {
      const histories = [
        [entry(10, GW, 3, 80), entry(10, 4, 0, 80)],
        // player 20: 20 pts in GW4 but only 1 pt in GW5 — should NOT qualify
        [entry(20, 4, 20, 70), entry(20, GW, 1, 70)],
      ];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toHaveLength(0);
    });

    it('correctly finds the alternative in the right gameweek when player has multiple rounds', () => {
      const histories = [
        [entry(10, GW, 3, 80), entry(10, 6, 10, 80)],
        [entry(20, GW, 8, 75), entry(20, 6, 0, 75)], // better only in GW5
      ];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ element: 20, round: GW });
    });

    it('does not return entries from other gameweeks even if they have higher points', () => {
      // player 20 scored 20 in GW6 but only 2 in GW5
      const histories = [
        playerA_history,
        [entry(20, GW, 2, 75), entry(20, 6, 20, 75)],
      ];
      expect(findAlternatives(transfer(10, 80), GW, histories)).toHaveLength(0);
    });
  });

  // ── edge cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('treats a transferred-in player who scored 0 pts — any positive scorer qualifies', () => {
      const histories = [
        [entry(10, GW, 0, 80)],
        [entry(20, GW, 1, 80)], // just 1 pt is strictly greater than 0
      ];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      expect(result).toHaveLength(1);
      expect(result[0].element).toBe(20);
    });

    it('handles a very large player pool correctly', () => {
      const benchmark = entry(10, GW, 5, 80);
      const bigPool = Array.from({ length: 200 }, (_, i) => {
        const id = 100 + i;
        const pts = i % 2 === 0 ? 10 : 3; // every even-indexed player scored 10 (qualifies)
        return [entry(id, GW, pts, 70)];
      });
      const histories = [[benchmark], ...bigPool];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      // 100 players with 10 pts > 5 pts, all within budget
      expect(result).toHaveLength(100);
    });

    it('returns the correct history entry shape', () => {
      const histories = [playerA_history, [entry(20, GW, 9, 75)]];
      const result = findAlternatives(transfer(10, 80), GW, histories);
      expect(result[0]).toEqual({ element: 20, round: GW, total_points: 9, value: 75 });
    });
  });
});
