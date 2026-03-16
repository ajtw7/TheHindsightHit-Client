import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
  }`;

const NavLinks = ({ mgrId, onClose }) => {
  return (
    <>
      <NavLink to={`/manager/${mgrId}/profile`} className={linkClass} onClick={onClose}>Manager</NavLink>
      <NavLink to={`/manager/${mgrId}/gameweek-history`} className={linkClass} onClick={onClose}>GW History</NavLink>
      <NavLink to={`/manager/${mgrId}/fixtures`} className={linkClass} onClick={onClose}>Fixtures</NavLink>
      <NavLink to={`/manager/${mgrId}/transfers`} className={linkClass} onClick={onClose}>Transfers</NavLink>
    </>
  );
};

const Nav = ({ mgrId, onSwitchTeam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = () => {
    setIsOpen(false);
    onSwitchTeam();
    navigate('/');
  };

  return (
    <>
      <nav className="flex justify-end items-center gap-3">
        <div className="hidden gap-6 md:flex items-center">
          <NavLinks mgrId={mgrId} />
          <button
            onClick={handleSwitch}
            className="text-slate-400 hover:text-red-400 transition-colors"
            aria-label="Switch team"
            title="Switch team"
          >
            <LogOut size={16} />
          </button>
        </div>
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {isOpen && (
        <div className="flex basis-full flex-col gap-1 border-t border-slate-700 pt-3 mt-1 w-full">
          <NavLinks mgrId={mgrId} onClose={() => setIsOpen(false)} />
          <button
            onClick={handleSwitch}
            className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors text-left mt-2 pt-2 border-t border-slate-700 flex items-center gap-2"
          >
            <LogOut size={14} />
            Switch Team
          </button>
        </div>
      )}
    </>
  );
};

export default Nav;
