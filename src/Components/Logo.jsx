import { Link } from 'react-router-dom';

const LOGO_SRC = `${process.env.PUBLIC_URL}/THH—Vector_v1.png`;

const Logo = () => {
  return (
    <Link to="/">
      <img
        src={LOGO_SRC}
        alt="The Hindsight Hit — FPL Transfer Analytics"
        className="h-9 md:h-12 w-auto transition-opacity duration-150 ease-in hover:opacity-[0.85]"
        loading="eager"
        fetchPriority="high"
      />
    </Link>
  );
};

export default Logo;
