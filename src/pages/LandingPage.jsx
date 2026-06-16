import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Statistics from '../components/Statistics.jsx';
import CallToAction from '../components/CallToAction.jsx';
import Footer from '../components/Footer.jsx';

function LandingPage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Statistics />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
