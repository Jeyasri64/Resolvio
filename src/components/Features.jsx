import { features } from '../data/landingData.js';

function Features() {
  return (
    <section className="section" id="features">
      <div className="section-heading reveal">
        <p className="eyebrow">Features</p>
        <h2 className="features-title">
        Everything teams need to move from complaint to closure.
        </h2>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <article className="feature-card reveal" style={{ animationDelay: `${index * 90}ms` }} key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Features;
