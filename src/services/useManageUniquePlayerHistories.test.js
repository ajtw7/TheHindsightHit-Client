import { renderHook, waitFor } from '@testing-library/react';
import { useManageUniquePlayerHistories } from './useManageUniquePlayerHistories';

const entry = (element, round, total_points = 5) => ({ element, round, total_points });

describe('useManageUniquePlayerHistories', () => {
  describe('empty input', () => {
    it('returns an empty array when given an empty array', async () => {
      const { result } = renderHook(() => useManageUniquePlayerHistories([]));
      await waitFor(() => expect(result.current[0]).toEqual([]));
    });
  });

  describe('deduplication per player', () => {
    it('keeps all entries when every round is unique', async () => {
      const input = [
        [entry(1, 1, 5), entry(1, 2, 8), entry(1, 3, 3)],
      ];
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(1));
      expect(result.current[0][0]).toHaveLength(3);
    });

    it('keeps only the FIRST occurrence when a round appears more than once', async () => {
      const input = [
        [
          entry(1, 5, 3),  // first occurrence of round 5 — must be kept
          entry(1, 5, 10), // duplicate round 5 — must be discarded
          entry(1, 6, 7),
        ],
      ];
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(1));

      const player = result.current[0][0];
      expect(player).toHaveLength(2); // rounds 5 and 6
      expect(player[0]).toMatchObject({ round: 5, total_points: 3 }); // first occurrence kept
      expect(player[1]).toMatchObject({ round: 6, total_points: 7 });
    });

    it('discards all extra duplicates when a round appears three times', async () => {
      const input = [
        [entry(1, 5, 1), entry(1, 5, 2), entry(1, 5, 3)],
      ];
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(1));
      expect(result.current[0][0]).toHaveLength(1);
      expect(result.current[0][0][0].total_points).toBe(1);
    });
  });

  describe('multiple players', () => {
    it('deduplicates each player independently', async () => {
      const input = [
        [entry(1, 5, 3), entry(1, 5, 99)], // player 1: duplicate round 5
        [entry(2, 5, 7), entry(2, 6, 4)],  // player 2: no duplicates
      ];
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(2));

      const [player1, player2] = result.current[0];
      expect(player1).toHaveLength(1);
      expect(player1[0].total_points).toBe(3); // first occurrence kept

      expect(player2).toHaveLength(2); // both rounds retained
    });

    it('preserves the order of players', async () => {
      const input = [
        [entry(10, 1, 5)],
        [entry(20, 1, 8)],
        [entry(30, 1, 3)],
      ];
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(3));

      expect(result.current[0][0][0].element).toBe(10);
      expect(result.current[0][1][0].element).toBe(20);
      expect(result.current[0][2][0].element).toBe(30);
    });
  });

  describe('empty player arrays', () => {
    it('handles a player with no round entries', async () => {
      const input = [[]]; // one player, zero rounds
      const { result } = renderHook(() => useManageUniquePlayerHistories(input));
      await waitFor(() => expect(result.current[0]).toHaveLength(1));
      expect(result.current[0][0]).toEqual([]);
    });
  });

  describe('return value', () => {
    it('also returns a setter as the second element', async () => {
      const { result } = renderHook(() => useManageUniquePlayerHistories([]));
      await waitFor(() => expect(result.current[0]).toEqual([]));
      expect(typeof result.current[1]).toBe('function');
    });

    it('re-runs when the playerHistories reference changes', async () => {
      let input = [[entry(1, 1, 5)]];
      const { result, rerender } = renderHook(() =>
        useManageUniquePlayerHistories(input)
      );
      await waitFor(() => expect(result.current[0]).toHaveLength(1));

      // New reference with additional player
      input = [[entry(1, 1, 5)], [entry(2, 1, 8)]];
      rerender();

      await waitFor(() => expect(result.current[0]).toHaveLength(2));
    });
  });
});
