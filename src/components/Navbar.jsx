import BrandLogo from './BrandLogo.jsx';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <a className="brand" href="/#home" aria-label="Resolvio home">
        <BrandLogo />
        <span>Resolvio</span>
      </a>

      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#features">Features</a>
        <a href="#process">How it works</a>
        <a href="#stats">Statistics</a>
        
      </nav>

      <div className="nav-actions">
        <Link className="nav-login" to="/login">
          Login
        </Link>
        <Link className="nav-signup" to="/signup">
          Sign up
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
