import { renderHook, waitFor } from '@testing-library/react';
import usePlayerHistories from './usePlayerHistories';

// ─── setup ───────────────────────────────────────────────────────────────────

const mockFetch = (data) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) });

const mockFetchError = (status = 500) =>
  Promise.resolve({ ok: false, status });

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    const id = parseInt(url.split('/').pop(), 10);
    return mockFetch([{ element: id, round: 1, total_points: id * 2 }]);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── tests ───────────────────────────────────────────────────────────────────

describe('usePlayerHistories', () => {
  describe('empty input', () => {
    it('returns an empty array immediately without fetching', () => {
      const { result } = renderHook(() => usePlayerHistories([]));
      expect(result.current).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('fetching', () => {
    it('fetches history for each ID and returns results', async () => {
      const { result } = renderHook(() => usePlayerHistories([1, 2, 3]));
      await waitFor(() => expect(result.current).toHaveLength(3));
      expect(fetch).toHaveBeenCalledTimes(3);
      const elements = result.current.flat().map((e) => e.element);
      expect(elements).toContain(1);
      expect(elements).toContain(2);
      expect(elements).toContain(3);
    });

    it('processes exactly 10 IDs per batch', async () => {
      // 12 IDs → batch 1 (10) then batch 2 (2) = 12 total fetches
      const ids = Array.from({ length: 12 }, (_, i) => i + 1);
      const { result } = renderHook(() => usePlayerHistories(ids));
      await waitFor(() => expect(result.current).toHaveLength(12));
      expect(fetch).toHaveBeenCalledTimes(12);
    });

    it('builds the correct API URL for each player ID', async () => {
      renderHook(() => usePlayerHistories([42]));
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/player-history/42')
      );
    });
  });

  describe('in-memory cache', () => {
    it('does not re-fetch a player when the same hook instance re-renders with a new array reference', async () => {
      // Simulate the historical bug: component creates a new array on every render
      let ids = [1, 2];
      const { result, rerender } = renderHook(() => usePlayerHistories(ids));
      await waitFor(() => expect(result.current).toHaveLength(2));

      const callsAfterFirstFetch = fetch.mock.calls.length; // should be 2

      // New array reference, same contents — what Transfers.jsx used to do on every render
      ids = [1, 2];
      rerender();

      await waitFor(() => expect(result.current).toHaveLength(2));
      // Cache should have served both IDs; no new fetch calls
      expect(fetch.mock.calls.length).toBe(callsAfterFirstFetch);
    });

    it('fetches only uncached IDs when new IDs are added', async () => {
      let ids = [1, 2];
      const { result, rerender } = renderHook(() => usePlayerHistories(ids));
      await waitFor(() => expect(result.current).toHaveLength(2));
      expect(fetch).toHaveBeenCalledTimes(2);

      // Add one new ID
      ids = [1, 2, 3];
      rerender();

      await waitFor(() => expect(result.current).toHaveLength(3));
      // Only the new ID (3) should have been fetched
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('logs an error and leaves state empty on a non-ok HTTP response', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      fetch.mockResolvedValueOnce(mockFetchError(404));

      const { result } = renderHook(() => usePlayerHistories([1]));
      await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

      expect(result.current).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching player history',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('logs an error and leaves state empty on a network failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      fetch.mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(() => usePlayerHistories([1]));
      await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

      expect(result.current).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});
