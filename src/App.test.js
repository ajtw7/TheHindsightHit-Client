import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// AuthContext is mocked entirely so Firebase is never initialised in tests.
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    isPro: false,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Reset all fetch mocks between tests
  jest.restoreAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolves with a minimal gameweeks payload after a short delay. */
function mockGameweeksFetch() {
  const gameweeks = [
    { id: 29, name: 'Gameweek 29', is_current: true, finished: false },
  ];
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/gameweeks')) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve(gameweeks),
            }),
          50
        )
      );
    }
    // All other endpoints return empty data so they don't cause errors
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test('renders without crashing at root', () => {
  renderAt('/');
});

test('landing page renders immediately at "/" with empty localStorage — no spinner', () => {
  // Do NOT mock fetch; with hasMgrId=false the hooks should not fetch at all
  renderAt('/');

  // The landing page headline should be visible immediately
  expect(screen.queryByText(/loading your data/i)).not.toBeInTheDocument();

  // The entry point / CTA copy is present
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
});

test('spinner is shown while data loads on a manager route with empty localStorage', async () => {
  mockGameweeksFetch();
  renderAt('/manager/7478006/transfers');

  // Spinner should appear immediately while gameweeks are still loading
  expect(screen.getByText(/loading your data/i)).toBeInTheDocument();

  // After the mock resolves, spinner should disappear
  await waitFor(() =>
    expect(screen.queryByText(/loading your data/i)).not.toBeInTheDocument(),
    { timeout: 500 }
  );
});

test('spinner is NOT shown at "/" even when no data has loaded yet', () => {
  // Stall all fetches indefinitely — simulates cold load with empty localStorage
  jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
  renderAt('/');

  expect(screen.queryByText(/loading your data/i)).not.toBeInTheDocument();
});

test('landing page renders with cached gameweeks in localStorage', () => {
  // Seed the cache so the bootstrap hooks would skip fetching
  const cacheEntry = JSON.stringify({
    d: [{ id: 29, name: 'Gameweek 29', is_current: true, finished: false }],
    e: Date.now() + 60_000,
  });
  localStorage.setItem('thh_v1_gameweeks', cacheEntry);

  renderAt('/');

  expect(screen.queryByText(/loading your data/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
});
