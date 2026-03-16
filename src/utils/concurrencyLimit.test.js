import concurrencyLimit from './concurrencyLimit';

describe('concurrencyLimit', () => {
  test('respects concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;

    const makeTask = (ms) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((r) => setTimeout(r, ms));
      running--;
      return 'done';
    };

    const tasks = Array.from({ length: 6 }, () => makeTask(50));
    await concurrencyLimit(tasks, 2);

    expect(maxRunning).toBe(2);
  });

  test('returns results in input order', async () => {
    const tasks = [
      async () => { await new Promise((r) => setTimeout(r, 30)); return 'a'; },
      async () => { return 'b'; },
      async () => { await new Promise((r) => setTimeout(r, 10)); return 'c'; },
    ];

    const results = await concurrencyLimit(tasks, 2);

    expect(results).toEqual([
      { status: 'fulfilled', value: 'a' },
      { status: 'fulfilled', value: 'b' },
      { status: 'fulfilled', value: 'c' },
    ]);
  });

  test('handles mixed success and failure', async () => {
    const tasks = [
      async () => 'ok',
      async () => { throw new Error('fail'); },
      async () => 'also ok',
    ];

    const results = await concurrencyLimit(tasks, 3);

    expect(results[0]).toEqual({ status: 'fulfilled', value: 'ok' });
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('fail');
    expect(results[2]).toEqual({ status: 'fulfilled', value: 'also ok' });
  });

  test('returns empty array for empty task list', async () => {
    const results = await concurrencyLimit([], 3);
    expect(results).toEqual([]);
  });

  test('works when limit exceeds task count', async () => {
    const tasks = [async () => 1, async () => 2];
    const results = await concurrencyLimit(tasks, 10);

    expect(results).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 2 },
    ]);
  });
});
