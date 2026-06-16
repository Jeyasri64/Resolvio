import { steps } from '../data/landingData.js';

function HowItWorks() {
  return (
    <section className="section process-section" id="process">
      <div className="section-heading reveal">
        <p className="eyebrow">How it works</p>
        <h2>A simple workflow students and admins can trust.</h2>
      </div>

      <div className="process-list">
        {steps.map((step, index) => (
          <article className="process-step reveal" style={{ animationDelay: `${index * 110}ms` }} key={step.title}>
            <span className="step-number">{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
