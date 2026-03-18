import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from './utils/analytics';

const LOGO_SRC = `${process.env.PUBLIC_URL}/THH—Vector_v1.png`;

export default function HomePage({ setMgrId, errorBanner }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    const id = Number(trimmed);
    if (!trimmed || !Number.isInteger(id) || id <= 0) {
      setError('Please enter a valid FPL Team ID');
      return;
    }
    setError('');
    setMgrId(id);
    setInputValue('');
    trackEvent('team_searched', { teamId: String(id) });
    navigate(`/manager/${id}/transfers`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0F1620' }}>
      <div className="w-full max-w-md">
        {/* Error banner from redirect */}
        {errorBanner && (
          <div className="mb-6">{errorBanner}</div>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={LOGO_SRC}
            alt="The Hindsight Hit"
            className="h-16 md:h-20 w-auto"
          />
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-3 leading-tight">
          See exactly what your transfers cost you.
        </h1>
        <p className="text-center text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Enter your FPL Team ID to analyse every transfer decision you've made this season.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="team-id"
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              placeholder="Your FPL Team ID"
              className="w-full border text-white rounded-xl px-4 py-3.5 focus:outline-none placeholder-slate-500 text-base"
              style={{
                backgroundColor: '#0F1620',
                borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.15)',
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = '#00E87A';
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full font-bold rounded-xl px-6 py-3.5 transition-colors text-base"
            style={{
              backgroundColor: '#00E87A',
              color: '#0F1620',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#00d46f')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#00E87A')}
          >
            Analyse My Transfers
          </button>
        </form>

        {/* Helper text */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Find your Team ID on the FPL website under Points — tap your team name — the number in the URL is your ID.
        </p>
      </div>
    </div>
  );
}
