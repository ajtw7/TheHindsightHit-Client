import { useEffect, useState, useContext, useMemo } from 'react';
import { PlayerContext } from './services/context';
import { findAlternatives } from './utils/findAlternatives';
import useTransferImpact from './services/useTransferImpact';
import { trackEvent } from './utils/analytics';

export default function Transfers({ myTransfers, mgrId }) {
  const [enhancedTransfers, setEnhancedTransfers] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedGW, setSelectedGW] = useState(null);
  const { allPlayers, uniquePlayerHistories } = useContext(PlayerContext);
  const { transferImpact } = useTransferImpact(mgrId);

  const playerLookup = useMemo(
    () => allPlayers.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [allPlayers]
  );

  // Build a lookup for transfer impact by GW + playerIn.id
  const impactLookup = useMemo(() => {
    if (!transferImpact || !Array.isArray(transferImpact)) return {};
    const lookup = {};
    for (const item of transferImpact) {
      if (item.gameweek != null && item.playerIn?.id != null) {
        lookup[`${item.gameweek}_${item.playerIn.id}`] = item;
      }
    }
    return lookup;
  }, [transferImpact]);

  useEffect(() => {
    if (!myTransfers.length) return;

    setEnhancedTransfers(
      myTransfers.map((transfer) => ({
        ...transfer,
        playerIn: playerLookup[transfer.element_in] ?? { web_name: `#${transfer.element_in}` },
        playerOut: playerLookup[transfer.element_out] ?? { web_name: `#${transfer.element_out}` },
        alternatives: uniquePlayerHistories.length
          ? findAlternatives(transfer, transfer.event, uniquePlayerHistories)
              .sort((a, b) => b.total_points - a.total_points)
          : null,
        impact: impactLookup[`${transfer.event}_${transfer.element_in}`] ?? null,
      }))
    );
  }, [myTransfers, uniquePlayerHistories, playerLookup, impactLookup]);

  const availableGWs = useMemo(
    () => [...new Set(myTransfers.map((t) => t.event))].sort((a, b) => b - a),
    [myTransfers]
  );

  const filteredTransfers = useMemo(
    () =>
      selectedGW == null
        ? enhancedTransfers
        : enhancedTransfers.filter((t) => t.event === selectedGW),
    [enhancedTransfers, selectedGW]
  );

  const toggleCard = (cardKey, gameweek) => {
    setExpandedCards((prev) => {
      const willExpand = !prev[cardKey];
      if (willExpand) {
        trackEvent('alternatives_viewed', { gameweek });
      }
      return { ...prev, [cardKey]: willExpand };
    });
  };

  const POSITION_MAP = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Transfers</h1>

      {myTransfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400 text-base mb-2">No transfers recorded yet for this team.</p>
          <p className="text-slate-500 text-sm">Check back after Gameweek 2.</p>
        </div>
      ) : (<>
      <p className="text-slate-400 text-sm mb-5">
        Tap <span className="text-emerald-400 font-medium">Show Alternatives</span> to
        see who you could have bought instead.
      </p>

      {/* GW filter */}
      <select
        value={selectedGW ?? ''}
        onChange={(e) => {
          const gw = e.target.value ? Number(e.target.value) : null;
          setSelectedGW(gw);
          if (gw != null) trackEvent('gw_filter_changed', { gameweek: gw });
        }}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 mb-5 focus:outline-none focus:border-emerald-400"
      >
        <option value="">All Gameweeks</option>
        {availableGWs.map((gw) => (
          <option key={gw} value={gw}>
            GW {gw}
          </option>
        ))}
      </select>

      {filteredTransfers.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">
          No transfers for this gameweek.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTransfers.map((transfer) => {
            const cardKey = `${transfer.entry}-${transfer.event}-${transfer.time}`;
            const isExpanded = expandedCards[cardKey];
            const hasAlternatives = transfer.alternatives !== null && transfer.alternatives.length > 0;

            return (
              <div
                key={cardKey}
                className="bg-slate-800 rounded-2xl border border-slate-700 p-4"
              >
                {/* GW badge + date */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                    GW {transfer.event}
                  </span>
                  <span className="text-slate-500 text-xs flex-shrink-0">
                    {new Date(transfer.time).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Player in / out */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                      In
                    </p>
                    <p className="text-emerald-400 font-bold text-sm leading-snug break-words">
                      {transfer.playerIn.web_name}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      £{(transfer.element_in_cost / 10).toFixed(1)}m
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                      Out
                    </p>
                    <p className="text-red-400 font-bold text-sm leading-snug break-words">
                      {transfer.playerOut.web_name}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      £{(transfer.element_out_cost / 10).toFixed(1)}m
                    </p>
                  </div>
                </div>

                {/* Transfer impact breakdown */}
                {transfer.impact != null && (() => {
                  const net = transfer.impact.netPointImpact;
                  const inPts = transfer.impact.playerIn?.pointsSinceTransfer ?? 0;
                  const outPts = transfer.impact.playerOut?.pointsSinceTransfer ?? 0;
                  const netColor = net > 0 ? '#00E87A' : net < 0 ? '#ef4444' : 'rgba(255,255,255,0.5)';
                  const netArrow = net > 0 ? '▲' : net < 0 ? '▼' : '';
                  return (
                    <div className="bg-slate-700/30 rounded-xl px-3 py-2.5 mb-3">
                      <p className="uppercase font-semibold tracking-wide mb-1.5" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                        Points since GW {transfer.impact.gameweek ?? transfer.event}
                      </p>
                      <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: '#00E87A' }} className="font-medium">{transfer.playerIn.web_name}</span>
                          <span className="text-white font-bold">{inPts}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: '#ef4444' }} className="font-medium">{transfer.playerOut.web_name}</span>
                          <span className="text-white font-bold">{outPts}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        {netArrow && <span style={{ color: netColor, fontSize: '10px' }}>{netArrow}</span>}
                        <span className="font-bold" style={{ fontSize: '14px', color: netColor }}>
                          {net > 0 ? '+' : net < 0 ? '' : ''}{net} net
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Show/Hide Alternatives button */}
                <button
                  onClick={() => hasAlternatives && toggleCard(cardKey, transfer.event)}
                  disabled={transfer.alternatives === null || !hasAlternatives}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    transfer.alternatives === null
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : hasAlternatives
                      ? 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-default'
                  }`}
                >
                  {transfer.alternatives === null
                    ? 'Loading alternatives…'
                    : hasAlternatives
                    ? isExpanded
                      ? 'Hide Alternatives'
                      : `Show ${transfer.alternatives.length} Alternative${
                          transfer.alternatives.length !== 1 ? 's' : ''
                        }`
                    : 'No Better Alternatives Found'}
                </button>

                {/* Expanded alternatives panel */}
                {isExpanded && hasAlternatives && (
                  <div className="mt-3 space-y-2">
                    <p className="text-slate-400 text-xs mb-2">
                      Players who scored more at ≤ £{(transfer.element_in_cost / 10).toFixed(1)}m in GW {transfer.event}:
                    </p>
                    {transfer.alternatives.map((alt) => {
                      const player = playerLookup[alt.element];
                      const pos = POSITION_MAP[player?.element_type] ?? '?';
                      return (
                        <div
                          key={alt.element}
                          className="flex items-center justify-between bg-slate-700/60 rounded-xl px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-slate-400 bg-slate-600/50 px-1.5 py-0.5 rounded flex-shrink-0">
                              {pos}
                            </span>
                            <span className="text-white text-sm font-medium truncate">
                              {player?.web_name ?? `Player ${alt.element}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <span className="text-slate-400 text-xs">
                              £{(alt.value / 10).toFixed(1)}m
                            </span>
                            <span className="text-emerald-400 font-bold text-sm">
                              {alt.total_points} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>)}
    </div>
  );
}
