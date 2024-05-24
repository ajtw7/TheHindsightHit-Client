import react from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  return (
    <>
      <h1>THE HINDSIGHT HIT</h1>
      <nav className='sticky-menu'>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/manager-profile">Manager</NavLink>
          </li>
          <li>
            <NavLink to="/fixtures">Fixtures</NavLink>
          </li>
          <li>
            <NavLink to="/transfers">Transfers</NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Nav;
