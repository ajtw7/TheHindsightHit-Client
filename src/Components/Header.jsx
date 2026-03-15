import Nav from './Nav';
import Logo from './Logo';

const Header = ({ mgrId, onSwitchTeam }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <Logo />
        <span className="text-emerald-400 font-bold text-base tracking-tight">
          THE HINDSIGHT HIT
        </span>
        <Nav mgrId={mgrId} onSwitchTeam={onSwitchTeam} />
      </div>
    </header>
  );
};

export default Header;
