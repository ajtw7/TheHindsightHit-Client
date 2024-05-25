import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NavLinks = () => {
  return (
    <>
      {/* <NavLink to="/">Home</NavLink> */}
      <NavLink to="/manager-profile">Manager</NavLink>
      <NavLink to="/gameweek-history">Gameweek History</NavLink>
      <NavLink to="/fixtures">Fixtures</NavLink>
      <NavLink to="/transfers">Transfers</NavLink>
    </>
  );
};
const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavBar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="w-1/3 flex justify-end">
        <div className="hidden w-full justify-between md:flex">
          <NavLinks />
        </div>
        <div className="md:hidden">
          <button onClick={toggleNavBar}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {isOpen && (
        <div className="flex basis-full flex-col items-centered ">
          <NavLinks />
        </div>
      )}
    </>
  );
};

export default Nav;
