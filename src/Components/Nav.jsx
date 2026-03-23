import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors py-2 block ${
    isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
  }`;

const NavLinks = ({ mgrId, onClose }) => (
  <>
    <NavLink to={`/manager/${mgrId}/profile`} className={linkClass} onClick={onClose}>Manager</NavLink>
    <NavLink to={`/manager/${mgrId}/gameweek-history`} className={linkClass} onClick={onClose}>GW History</NavLink>
    <NavLink to={`/manager/${mgrId}/fixtures`} className={linkClass} onClick={onClose}>Fixtures</NavLink>
    <NavLink to={`/manager/${mgrId}/transfers`} className={linkClass} onClick={onClose}>Transfers</NavLink>
  </>
);

// Account dropdown — shown when signed in (desktop)
const AccountDropdown = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const email = user.email ?? '';
  const displayEmail = email.length > 22 ? email.slice(0, 20) + '…' : email;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        aria-label="Account menu"
      >
        <User size={14} style={{ color: '#00E87A' }} />
        <span className="hidden lg:inline">{displayEmail}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-xl py-1 z-40 shadow-xl"
          style={{ backgroundColor: '#1C2B3A', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-4 py-2.5 text-xs truncate"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {email}
          </div>
          <div className="h-px mx-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
            style={{ minHeight: '40px' }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const Nav = ({ mgrId, onSwitchTeam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSwitch = () => {
    setIsOpen(false);
    onSwitchTeam();
    navigate('/');
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <>
      <nav className="flex justify-end items-center gap-3">
        {/* Desktop */}
        <div className="hidden gap-6 md:flex items-center">
          {mgrId && <NavLinks mgrId={mgrId} />}
          {mgrId && (
            <button
              onClick={handleSwitch}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium flex items-center gap-1.5"
              aria-label="Switch team"
              title="Switch team"
            >
              <LogOut size={14} />
              <span className="hidden lg:inline">Switch Team</span>
            </button>
          )}
          {/* Auth */}
          {user ? (
            <AccountDropdown user={user} onSignOut={handleSignOut} />
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#00E87A', border: '1px solid rgba(0,232,122,0.3)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,232,122,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors p-2 -mr-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="flex basis-full flex-col gap-0 border-t border-slate-700 pt-2 mt-1 w-full">
          {mgrId && <NavLinks mgrId={mgrId} onClose={() => setIsOpen(false)} />}
          {mgrId && (
            <button
              onClick={handleSwitch}
              className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors text-left mt-1 pt-2 border-t border-slate-700 flex items-center gap-2 min-h-[44px]"
            >
              <LogOut size={14} />
              Switch Team
            </button>
          )}
          {/* Auth — mobile */}
          <div className={`${mgrId ? 'mt-1 pt-2 border-t border-slate-700' : 'mt-1'}`}>
            {user ? (
              <div className="flex flex-col gap-1">
                <p
                  className="text-xs truncate py-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {user.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors text-left flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsOpen(false); setShowAuth(true); }}
                className="text-sm font-medium text-left min-h-[44px] flex items-center"
                style={{ color: '#00E87A' }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Nav;
