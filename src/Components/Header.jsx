import Nav from './Nav';
import Logo from './Logo';

const Header = () => {
  return (
    <header className="bg-dark-bckground sticky top top-0 z-[20] mx-auto flex flex-wrap w-full items-center justify-between border-gray-500 p-8 ">
      <Logo />
      <h1>THE HINDSIGHT HIT</h1>
      <Nav />
    </header>
  );
};

export default Header;
