import BrandLogo from './BrandLogo.jsx';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content reveal">
        <p className="eyebrow">Campus complaint management</p>
        <h1>Resolvio hostel and campus issues with clarity.</h1>
        <p className="hero-copy">
          Resolvio brings student complaints, admin workflows, notifications, and feedback into one focused
          experience built for faster campus support.
        </p>
        <div className="hero-actions">
          <Link className="button primary" to="/signup">
            Get started
          </Link>
          <a className="button secondary" href="#features">
            Explore features
          </a>
        </div>
      </div>

      <div className="hero-visual reveal delay-1" aria-label="Resolvio dashboard preview">
        <div className="hero-logo-card">
          <BrandLogo className="hero-logo" />
        </div>
        <div className="dashboard-shell">
          <div className="dashboard-top">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="dashboard-grid">
            <div className="metric-tile">
              <strong>42</strong>
              <span>Open tickets</span>
            </div>
            <div className="metric-tile accent">
              <strong>18</strong>
              <span>Resolved today</span>
            </div>
            <div className="ticket-card wide">
              <span className="status-dot active"></span>
              Electrical issue assigned to maintenance
            </div>
            <div className="ticket-card">
              <span className="status-dot"></span>
              Water supply
            </div>
            <div className="ticket-card">
              <span className="status-dot warning"></span>
              Room repair
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
