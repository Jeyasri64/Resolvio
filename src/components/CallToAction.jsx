import { Link } from 'react-router-dom';

function CallToAction() {
  return (
    <section className="cta-section">
      <div className="cta-content reveal">
        <p className="eyebrow">Ready for better support?</p>
        <h2>Give students a clear path to report issues and teams a cleaner way to resolve them.</h2>
        <Link className="button primary light" to="/signup">
          Open Resolvio
        </Link>
      </div>
    </section>
  );
}

export default CallToAction;
