import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Transfers from './Transfers';
import { PlayerContext } from './services/context';

// ─── fixtures ─────────────────────────────────────────────────────────────────

const entry = (element, round, total_points, value) => ({
  element,
  round,
  total_points,
  value,
});

const allPlayers = [
  { id: 10, web_name: 'Salah', element_type: 3 },
  { id: 20, web_name: 'Haaland', element_type: 4 },
  { id: 30, web_name: 'Saka', element_type: 3 },
  { id: 40, web_name: 'Palmer', element_type: 3 },
  { id: 5, web_name: 'Unknown Out', element_type: 2 },
];

// GW5 performances:
//   Salah (10): 3 pts @ £8.0m  ← transferred in, budget 8.0m
//   Haaland (20): 14 pts @ £14.5m  ← better, but WAY over budget
//   Saka (30): 9 pts @ £7.5m       ← better AND affordable ✓
//   Palmer (40): 3 pts @ £5.0m     ← same points, not an alternative
const uniquePlayerHistories = [
  [entry(10, 5, 3, 80)],
  [entry(20, 5, 14, 145)],
  [entry(30, 5, 9, 75)],
  [entry(40, 5, 3, 50)],
];

const baseTransfer = {
  element_in: 10,
  element_out: 5,
  element_in_cost: 80,
  element_out_cost: 65,
  event: 5,
  time: '2024-01-01T12:00:00Z',
  entry: 123,
};

const renderTransfers = (
  transfers = [baseTransfer],
  histories = uniquePlayerHistories,
  players = allPlayers
) =>
  render(
    <PlayerContext.Provider value={{ allPlayers: players, uniquePlayerHistories: histories }}>
      <Transfers myTransfers={transfers} />
    </PlayerContext.Provider>
  );

// ─── helpers ─────────────────────────────────────────────────────────────────

const expandAlternatives = async () => {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Show \d+ Alternative/ })).toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', { name: /Show \d+ Alternative/ }));
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe('Transfers', () => {
  describe('page rendering', () => {
    it('renders the heading', async () => {
      renderTransfers();
      expect(screen.getByRole('heading', { name: 'Transfers' })).toBeInTheDocument();
    });

    it('renders a "Show Alternatives" button once data is loaded', async () => {
      renderTransfers();
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /Show \d+ Alternative/ })
        ).toBeInTheDocument()
      );
    });

    it('does not render transfer cards while transfers are empty', () => {
      renderTransfers([], []);
      expect(screen.queryByText(/GW \d/)).not.toBeInTheDocument();
    });

    it('renders transfer cards immediately when transfers are loaded but histories are still empty', async () => {
      renderTransfers([baseTransfer], []);
      await waitFor(() =>
        expect(screen.queryAllByText(/GW \d/).length).toBeGreaterThan(0)
      );
    });

    it('shows "Loading alternatives…" while player histories are not yet available', async () => {
      renderTransfers([baseTransfer], []);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Loading alternatives…' })
        ).toBeInTheDocument()
      );
    });

    it('replaces "Loading alternatives…" with a real count once histories arrive', async () => {
      const { rerender } = render(
        <PlayerContext.Provider value={{ allPlayers, uniquePlayerHistories: [] }}>
          <Transfers myTransfers={[baseTransfer]} />
        </PlayerContext.Provider>
      );

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Loading alternatives…' })).toBeInTheDocument()
      );

      rerender(
        <PlayerContext.Provider value={{ allPlayers, uniquePlayerHistories }}>
          <Transfers myTransfers={[baseTransfer]} />
        </PlayerContext.Provider>
      );

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Show 1 Alternative' })).toBeInTheDocument()
      );
    });
  });

  describe('alternatives count in button', () => {
    it('shows the correct count of qualifying alternatives', async () => {
      renderTransfers();
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Show 1 Alternative' })
        ).toBeInTheDocument()
      );
      // Only Saka qualifies (9 pts > 3, £7.5m ≤ £8.0m); Haaland is over budget
    });

    it('shows "No Better Alternatives Found" when no alternatives qualify', async () => {
      // Transfer in a player who outscored everyone
      const dominantTransfer = { ...baseTransfer, element_in: 20 }; // Haaland, 14 pts
      renderTransfers([dominantTransfer]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'No Better Alternatives Found' })
        ).toBeInTheDocument()
      );
    });

    it('shows correct count for multiple transfers', async () => {
      const secondTransfer = {
        element_in: 10, element_out: 5,
        element_in_cost: 80, element_out_cost: 65,
        event: 5, time: '2024-01-02T12:00:00Z', entry: 123,
      };
      renderTransfers([baseTransfer, secondTransfer]);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /Show \d+ Alternative/ });
        expect(buttons).toHaveLength(2);
        buttons.forEach((btn) => expect(btn).toHaveTextContent('Show 1 Alternative'));
      });
    });
  });

  // ── Inline alternatives panel ──────────────────────────────────────────────

  describe('Show Alternatives panel', () => {
    describe('expanding', () => {
      it('expands the panel when the button is clicked', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByText(/Saka/)).toBeInTheDocument();
      });

      it('toggles button text to "Hide Alternatives" when expanded', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByRole('button', { name: 'Hide Alternatives' })).toBeInTheDocument();
      });

      it('shows the transferred-in player info on the card', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByText(/Salah/)).toBeInTheDocument();
      });
    });

    describe('alternatives list — qualifying player', () => {
      it('shows Saka as an alternative (more points, within budget)', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByText(/Saka/)).toBeInTheDocument();
      });

      it('shows the correct points for the alternative', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByText(/9 pts/)).toBeInTheDocument();
      });

      it('shows the correct price for the alternative (value / 10 to 1 dp)', async () => {
        renderTransfers();
        await expandAlternatives();
        // Saka value = 75 → £7.5m
        expect(screen.getByText(/£7\.5m/)).toBeInTheDocument();
      });
    });

    describe('alternatives list — disqualified players', () => {
      it('does NOT show Haaland (better points, but over budget)', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.queryByText(/Haaland/)).not.toBeInTheDocument();
      });

      it('does NOT show Palmer (same points, not strictly greater)', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.queryByText(/Palmer/)).not.toBeInTheDocument();
      });
    });

    describe('collapsing', () => {
      it('collapses when the Hide Alternatives button is clicked', async () => {
        renderTransfers();
        await expandAlternatives();
        expect(screen.getByText(/Saka/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Hide Alternatives' }));
        // Saka should still be visible in the page context (player name on card),
        // but the alternatives panel text specific to it should be gone
        await waitFor(() =>
          expect(screen.queryByText(/9 pts/)).not.toBeInTheDocument()
        );
      });
    });

    describe('no alternatives case', () => {
      it('disables button when no qualifying alternatives exist', async () => {
        const dominantTransfer = { ...baseTransfer, element_in: 20 }; // Haaland, 14 pts
        renderTransfers([dominantTransfer]);
        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'No Better Alternatives Found' })
          ).toBeInTheDocument()
        );
        expect(
          screen.getByRole('button', { name: 'No Better Alternatives Found' })
        ).toBeDisabled();
      });
    });
  });

  describe('gameweek-specific accuracy', () => {
    it('only shows alternatives who scored in the same gameweek as the transfer', async () => {
      // Player 30 scored 9 in GW5 but had a terrible GW6
      const gw6Histories = [
        [entry(10, 6, 3, 80)],  // Salah GW6
        [entry(30, 6, 1, 75)],  // Saka GW6: 1 pt — worse than Salah
      ];
      const gw6Transfer = { ...baseTransfer, event: 6 };
      renderTransfers([gw6Transfer], gw6Histories);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'No Better Alternatives Found' })
        ).toBeInTheDocument()
      );
    });

    it('finds alternatives for the correct gameweek when players have multi-round histories', async () => {
      // Player 10 had GW4 (2 pts) and GW5 (3 pts)
      // Player 30 had GW4 (1 pt) and GW5 (9 pts)
      const multiRoundHistories = [
        [entry(10, 4, 2, 80), entry(10, 5, 3, 80)],
        [entry(30, 4, 1, 75), entry(30, 5, 9, 75)],
      ];
      renderTransfers([baseTransfer], multiRoundHistories); // GW5 transfer
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Show 1 Alternative' })
        ).toBeInTheDocument()
      );
    });
  });
});
