import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
  }`;

const NavLinks = ({ onClose }) => {
  return (
    <>
      <NavLink to="/manager-profile" className={linkClass} onClick={onClose}>Manager</NavLink>
      <NavLink to="/gameweek-history" className={linkClass} onClick={onClose}>GW History</NavLink>
      <NavLink to="/fixtures" className={linkClass} onClick={onClose}>Fixtures</NavLink>
      <NavLink to="/transfers" className={linkClass} onClick={onClose}>Transfers</NavLink>
    </>
  );
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-end">
        <div className="hidden gap-6 md:flex">
          <NavLinks />
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
          <NavLinks onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Nav;
