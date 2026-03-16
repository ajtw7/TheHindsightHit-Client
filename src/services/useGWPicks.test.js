import { renderHook, waitFor } from '@testing-library/react';
import useGWPicks from './useGWPicks';

const mockPicks = [
  { element: 10, position: 1, multiplier: 1 },
  { element: 20, position: 2, multiplier: 1 },
  { element: 30, position: 3, multiplier: 2 },
];

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches picks for a given GW and manager', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockPicks),
  });

  const { result } = renderHook(() => useGWPicks(5, 12345));

  await waitFor(() => expect(result.current.picks).toEqual(mockPicks));
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(false);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toContain('/12345/gw-player-stats/5');
});

test('returns empty array when gwId or mgrId is null', () => {
  const { result: r1 } = renderHook(() => useGWPicks(null, 12345));
  expect(r1.current.picks).toEqual([]);
  expect(global.fetch).not.toHaveBeenCalled();

  const { result: r2 } = renderHook(() => useGWPicks(5, null));
  expect(r2.current.picks).toEqual([]);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('uses cached data and skips fetch', async () => {
  localStorage.setItem(
    'thh_v1_gwPicks_12345_5',
    JSON.stringify({ d: mockPicks, e: 0 })
  );

  const { result } = renderHook(() => useGWPicks(5, 12345));

  await waitFor(() => expect(result.current.picks).toEqual(mockPicks));
  expect(global.fetch).not.toHaveBeenCalled();
});

test('sets error on fetch failure', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500 });

  const { result } = renderHook(() => useGWPicks(5, 12345));

  await waitFor(() => expect(result.current.error).toBeTruthy());
  expect(result.current.picks).toEqual([]);
});
