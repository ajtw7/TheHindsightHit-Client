/**
 * Run async task factories with at most `limit` running concurrently.
 * Returns results in input order with allSettled-style objects.
 *
 * @param {Array<() => Promise<T>>} tasks - Factory functions that return promises
 * @param {number} limit - Max concurrent tasks (default 3)
 * @returns {Promise<Array<{status: 'fulfilled', value: T} | {status: 'rejected', reason: any}>>}
 */
export default async function concurrencyLimit(tasks, limit = 3) {
  if (tasks.length === 0) return [];

  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function runNext() {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() };
      } catch (err) {
        results[i] = { status: 'rejected', reason: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => runNext());
  await Promise.all(workers);

  return results;
}
