import BrandLogo from './BrandLogo.jsx';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="brand footer-brand" href="/#home" aria-label="Resolvio home">
          <BrandLogo />
          <span>Resolvio</span>
        </a>
        <p>Complaint management designed for responsive campus operations.</p>
      </div>

      <div className="footer-links">
        <a href="#features">Features</a>
        <a href="#process">How it works</a>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign up</Link>
      </div>
    </footer>
  );
}

export default Footer;
