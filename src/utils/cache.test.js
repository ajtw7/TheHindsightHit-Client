import { initCache, cacheGet, cacheSet, TTL } from './cache';

beforeEach(() => {
  localStorage.clear();
});

describe('cacheGet', () => {
  it('returns null for a missing key', () => {
    expect(cacheGet('nope')).toBeNull();
  });

  it('returns data for a valid, non-expired entry', () => {
    localStorage.setItem(
      'thh_v1_foo',
      JSON.stringify({ d: { a: 1 }, e: Date.now() + 60000 })
    );
    expect(cacheGet('foo')).toEqual({ a: 1 });
  });

  it('returns null and removes key for an expired entry', () => {
    localStorage.setItem(
      'thh_v1_expired',
      JSON.stringify({ d: 'old', e: Date.now() - 1000 })
    );
    expect(cacheGet('expired')).toBeNull();
    expect(localStorage.getItem('thh_v1_expired')).toBeNull();
  });

  it('never expires when e === 0', () => {
    localStorage.setItem(
      'thh_v1_forever',
      JSON.stringify({ d: 'permanent', e: 0 })
    );
    expect(cacheGet('forever')).toBe('permanent');
  });

  it('returns null for corrupt JSON', () => {
    localStorage.setItem('thh_v1_bad', 'not-json');
    expect(cacheGet('bad')).toBeNull();
  });
});

describe('cacheSet', () => {
  it('stores data retrievable by cacheGet', () => {
    cacheSet('bar', [1, 2, 3], 60000);
    expect(cacheGet('bar')).toEqual([1, 2, 3]);
  });

  it('stores with ttl=0 for never-expiring entries', () => {
    cacheSet('perm', { x: true }, 0);
    const raw = JSON.parse(localStorage.getItem('thh_v1_perm'));
    expect(raw.e).toBe(0);
    expect(cacheGet('perm')).toEqual({ x: true });
  });

  it('evicts expired entries on quota error and retries', () => {
    // Seed an expired entry
    localStorage.setItem(
      'thh_v1_stale',
      JSON.stringify({ d: 'x', e: Date.now() - 5000 })
    );

    const originalSetItem = Storage.prototype.setItem;
    let callCount = 0;
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
      callCount++;
      if (callCount === 1 && k.startsWith('thh_v1_')) {
        throw new DOMException('QuotaExceededError');
      }
      return originalSetItem.call(this, k, v);
    });

    cacheSet('new', 'data', 60000);

    // Expired entry should have been evicted
    expect(localStorage.getItem('thh_v1_stale')).toBeNull();
    // New entry should have been written on retry
    expect(cacheGet('new')).toBe('data');

    Storage.prototype.setItem.mockRestore();
  });
});

describe('initCache', () => {
  it('clears old-version keys when version mismatches', () => {
    localStorage.setItem('thh_cacheVersion', 'v0');
    localStorage.setItem('thh_v0_old', 'data');
    localStorage.setItem('thh_v1_current', 'data');
    localStorage.setItem('unrelated', 'keep');

    initCache();

    expect(localStorage.getItem('thh_v0_old')).toBeNull();
    expect(localStorage.getItem('thh_v1_current')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(localStorage.getItem('thh_cacheVersion')).toBe('v1');
  });

  it('does nothing when version matches', () => {
    localStorage.setItem('thh_cacheVersion', 'v1');
    localStorage.setItem('thh_v1_data', 'keep');

    initCache();

    expect(localStorage.getItem('thh_v1_data')).toBe('keep');
  });
});

describe('TTL constants', () => {
  it('exports expected TTL values', () => {
    expect(TTL.GAMEWEEKS).toBe(4 * 60 * 60 * 1000);
    expect(TTL.TEAMS).toBe(24 * 60 * 60 * 1000);
    expect(TTL.ALL_PLAYERS).toBe(60 * 60 * 1000);
    expect(TTL.GW_LIVE_FINISHED).toBe(0);
    expect(TTL.PRICES).toBe(0);
  });
});
