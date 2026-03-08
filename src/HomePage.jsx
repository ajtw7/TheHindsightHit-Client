import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ setMgrId }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMgrId(Number(inputValue));
    setInputValue('');
    navigate('/manager-profile');
    // console.log('setMgrId:', setMgrId);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">The Hindsight Hit</h1>
          <p className="text-slate-400 text-sm">
            Enter your FPL team ID to analyse your transfers
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="team-id"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >
                Team ID
              </label>
              <input
                id="team-id"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                placeholder="e.g. 1234567"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 placeholder-slate-500 text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-900 font-bold rounded-xl px-6 py-3 transition-colors text-base"
            >
              Enter the Lab
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Find your team ID on the FPL website under Points › select your team
        </p>
      </div>
    </div>
  );
}
