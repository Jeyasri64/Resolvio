import logo from '../assets/hostel-complaint-logo.png';

function BrandLogo({ className = '' }) {
  return <img className={`brand-logo ${className}`.trim()} src={logo} alt="Hostel Complaint Management System" />;
}

export default BrandLogo;
