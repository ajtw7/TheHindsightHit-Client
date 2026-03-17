import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/">
      <img
        src={`${process.env.PUBLIC_URL}/thh-logo.svg`}
        alt="The Hindsight Hit — FPL Transfer Analytics"
        className="h-9 md:h-12 w-auto transition-opacity duration-150 ease-in hover:opacity-[0.85]"
      />
    </Link>
  );
};

export default Logo;
