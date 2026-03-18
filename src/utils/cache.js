const CACHE_VERSION = 'v1';
const KEY_PREFIX = `thh_${CACHE_VERSION}_`;
const VERSION_KEY = 'thh_cacheVersion';

/**
 * Call once on app startup to clear stale cache entries from
 * a previous code version.
 */
export function initCache() {
  try {
    // One-time cleanup: remove the plain 'mgrId' key written by old code
    // that used localStorage as the source of truth for the active team.
    // The app now reads mgrId exclusively from the URL.
    localStorage.removeItem('mgrId');

    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== CACHE_VERSION) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('thh_')) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
    }
  } catch {
    // localStorage unavailable — app works fine without cache
  }
}

/**
 * Read a cached value. Returns the data or null if missing/expired.
 */
export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (!raw) return null;
    const { d, e } = JSON.parse(raw);
    // e === 0 means never expires
    if (e !== 0 && e < Date.now()) {
      localStorage.removeItem(KEY_PREFIX + key);
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

/**
 * Store a value with a TTL in milliseconds.
 * ttlMs = 0 means the entry never expires.
 */
export function cacheSet(key, data, ttlMs) {
  const entry = JSON.stringify({
    d: data,
    e: ttlMs === 0 ? 0 : Date.now() + ttlMs,
  });
  try {
    localStorage.setItem(KEY_PREFIX + key, entry);
  } catch {
    // Quota exceeded — evict expired entries and retry once
    _evict();
    try {
      localStorage.setItem(KEY_PREFIX + key, entry);
    } catch {
      // Still full — skip caching; app works fine without it
    }
  }
}

/** Remove expired thh_ entries to free space. */
function _evict() {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      try {
        const { e } = JSON.parse(localStorage.getItem(k));
        if (e !== 0 && e < now) localStorage.removeItem(k);
      } catch {
        // Corrupt entry — remove it
        localStorage.removeItem(k);
      }
    }
  } catch {
    // Nothing we can do
  }
}

export const TTL = {
  GAMEWEEKS: 4 * 60 * 60 * 1000,       // 4 hours
  TEAMS: 24 * 60 * 60 * 1000,          // 24 hours
  ALL_PLAYERS: 60 * 60 * 1000,         // 1 hour
  MGR_DATA: 60 * 60 * 1000,            // 1 hour
  GW_STATS: 60 * 60 * 1000,            // 1 hour
  TRANSFERS: 30 * 60 * 1000,           // 30 min
  GW_HISTORY: 30 * 60 * 1000,          // 30 min
  GW_LIVE_FINISHED: 0,                 // never expires
  GW_LIVE_CURRENT: 5 * 60 * 1000,      // 5 min
  PRICES: 0,                            // never expires
};
