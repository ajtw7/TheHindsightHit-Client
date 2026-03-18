/**
 * Track a custom event via Plausible Analytics.
 * Falls back to no-op if Plausible is not loaded (e.g., ad-blocked).
 *
 * @param {string} eventName
 * @param {object} [props]
 */
export function trackEvent(eventName, props) {
  if (typeof window.plausible === 'function') {
    window.plausible(eventName, { props });
  }
}
