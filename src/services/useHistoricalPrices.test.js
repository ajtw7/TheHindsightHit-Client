import { renderHook, waitFor } from '@testing-library/react';
import useHistoricalPrices from './useHistoricalPrices';

const mockGW5Prices = { '1': 55, '2': 80, '3': 100 };
const mockGW6Prices = { '1': 60, '2': 80, '3': 95 };

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches prices for given GW IDs', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes('/5')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW5Prices) });
    if (url.includes('/6')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW6Prices) });
    return Promise.reject(new Error('Unknown URL'));
  });

  const { result } = renderHook(() => useHistoricalPrices([5, 6]));

  await waitFor(() => expect(Object.keys(result.current.historicalPrices).length).toBe(2));

  expect(result.current.historicalPrices[5]).toEqual(mockGW5Prices);
  expect(result.current.historicalPrices[6]['1']).toBe(60);
  expect(result.current.error).toBeNull();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('returns empty object when gwIds is empty', () => {
  const { result } = renderHook(() => useHistoricalPrices([]));
  expect(result.current.historicalPrices).toEqual({});
  expect(result.current.error).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('skips failed fetches without crashing and sets error', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes('/5')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW5Prices) });
    return Promise.resolve({ ok: false, status: 500 });
  });

  const { result } = renderHook(() => useHistoricalPrices([5, 99]));

  await waitFor(() => expect(result.current.historicalPrices[5]).toBeDefined());

  expect(result.current.historicalPrices[5]).toEqual(mockGW5Prices);
  expect(result.current.historicalPrices[99]).toBeUndefined();
  expect(result.current.error).toBe('Failed to load some price data');
});

test('caches results and does not re-fetch on re-render', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockGW5Prices),
  });

  const { result, rerender } = renderHook(({ ids }) => useHistoricalPrices(ids), {
    initialProps: { ids: [5] },
  });

  await waitFor(() => expect(result.current.historicalPrices[5]).toBeDefined());
  expect(global.fetch).toHaveBeenCalledTimes(1);

  rerender({ ids: [5] });
  await waitFor(() => expect(result.current.historicalPrices[5]).toBeDefined());
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('hydrates from localStorage and skips fetch for cached GWs', async () => {
  // Pre-populate localStorage with GW 5 data
  localStorage.setItem(
    'thh_v1_prices_5',
    JSON.stringify({ d: mockGW5Prices, e: 0 })
  );

  // Only GW 6 should be fetched
  global.fetch.mockImplementation((url) => {
    if (url.includes('/6')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGW6Prices) });
    return Promise.reject(new Error('Should not fetch GW 5'));
  });

  const { result } = renderHook(() => useHistoricalPrices([5, 6]));

  await waitFor(() => expect(Object.keys(result.current.historicalPrices).length).toBe(2));

  expect(result.current.historicalPrices[5]).toEqual(mockGW5Prices);
  expect(result.current.historicalPrices[6]).toEqual(mockGW6Prices);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toContain('/6');
});
