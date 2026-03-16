import { renderHook, waitFor } from '@testing-library/react';
import useGWLiveStats from './useGWLiveStats';

const mockGW5Response = {
  elements: [
    { id: 1, stats: { total_points: 9, minutes: 90, goals_scored: 1 } },
    { id: 2, stats: { total_points: 2, minutes: 45, goals_scored: 0 } },
  ],
};

const mockGW6Response = {
  elements: [
    { id: 1, stats: { total_points: 6, minutes: 90, goals_scored: 0 } },
    { id: 3, stats: { total_points: 12, minutes: 90, goals_scored: 2 } },
  ],
};

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches live stats for given GW IDs', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes('/5')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW5Response) });
    if (url.includes('/6')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW6Response) });
    return Promise.reject(new Error('Unknown URL'));
  });

  const { result } = renderHook(() => useGWLiveStats([5, 6], null));

  await waitFor(() => expect(Object.keys(result.current.gwLiveStats).length).toBe(2));

  expect(result.current.gwLiveStats[5].elements).toHaveLength(2);
  expect(result.current.gwLiveStats[6].elements[1].stats.total_points).toBe(12);
  expect(result.current.error).toBeNull();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('returns empty object when gwIds is empty', () => {
  const { result } = renderHook(() => useGWLiveStats([], null));
  expect(result.current.gwLiveStats).toEqual({});
  expect(result.current.error).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('skips failed fetches without crashing and sets error', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes('/5')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW5Response) });
    return Promise.resolve({ ok: false, status: 500 });
  });

  const { result } = renderHook(() => useGWLiveStats([5, 99], null));

  await waitFor(() => expect(result.current.gwLiveStats[5]).toBeDefined());

  expect(result.current.gwLiveStats[5].elements).toHaveLength(2);
  expect(result.current.gwLiveStats[99]).toBeUndefined();
  expect(result.current.error).toBe('Failed to load some live stats');
});

test('caches results and does not re-fetch on re-render', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockGW5Response),
  });

  const { result, rerender } = renderHook(({ ids }) => useGWLiveStats(ids, null), {
    initialProps: { ids: [5] },
  });

  await waitFor(() => expect(result.current.gwLiveStats[5]).toBeDefined());
  expect(global.fetch).toHaveBeenCalledTimes(1);

  rerender({ ids: [5] });
  await waitFor(() => expect(result.current.gwLiveStats[5]).toBeDefined());
  // Should not fetch again — same GW IDs, result is cached
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('hydrates from localStorage and skips fetch for cached GWs', async () => {
  // Pre-populate localStorage with GW 5 data
  localStorage.setItem(
    'thh_v1_gwLiveStats_5',
    JSON.stringify({ d: mockGW5Response, e: 0 })
  );

  // Only GW 6 should be fetched
  global.fetch.mockImplementation((url) => {
    if (url.includes('/6')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW6Response) });
    return Promise.reject(new Error('Should not fetch GW 5'));
  });

  const { result } = renderHook(() => useGWLiveStats([5, 6], null));

  await waitFor(() => expect(Object.keys(result.current.gwLiveStats).length).toBe(2));

  expect(result.current.gwLiveStats[5]).toEqual(mockGW5Response);
  expect(result.current.gwLiveStats[6]).toEqual(mockGW6Response);
  // Only GW 6 should have been fetched
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toContain('/6');
});
