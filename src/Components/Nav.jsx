import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors py-2 block ${
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
            className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium flex items-center gap-1.5"
            aria-label="Switch team"
            title="Switch team"
          >
            <LogOut size={14} />
            <span className="hidden lg:inline">Switch Team</span>
          </button>
        </div>
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors p-2 -mr-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {isOpen && (
        <div className="flex basis-full flex-col gap-0 border-t border-slate-700 pt-2 mt-1 w-full">
          <NavLinks mgrId={mgrId} onClose={() => setIsOpen(false)} />
          <button
            onClick={handleSwitch}
            className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors text-left mt-1 pt-2 border-t border-slate-700 flex items-center gap-2 min-h-[44px]"
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
