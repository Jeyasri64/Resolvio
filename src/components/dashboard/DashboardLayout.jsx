import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx"; 

function getWorkspaceItems(role) {
  if (role === "Admin") {
    return [];
  }

  return [
    { label: "Complaints", to: "/student-dashboard/recent-complaints" },
    { label: "Analytics", to: "/student-dashboard/statistics" },
    { label: "Messages", to: "/student-dashboard/recent-activity" },
    { label: "Settings", to: "/student-dashboard/profile" },
  ];
}

function DashboardLayout({ role, title, subtitle, children, dashboardLinks = [], onLogout, adminProfile, sidebarProfile }) {
  const workspaceItems = getWorkspaceItems(role);
  const profile = sidebarProfile || adminProfile;
  const basePath = role === "Student" ? "/student-dashboard" : "/admin-dashboard";

  return (
    <div className="dashboard-page">
      <aside className="app-sidebar" aria-label={`${role} navigation`}>
        <div>
          <Link className="brand dashboard-brand" to="/" aria-label="Resolvio home">
            <BrandLogo />
            <span>Resolvio</span>
          </Link>

          {profile ? (
            <div className="sidebar-profile-card">
              <div className="sidebar-profile-avatar">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={`${profile.fullName} avatar`} />
                ) : (
                  <span>{profile.fullName?.slice(0, 1) || 'A'}</span>
                )}
              </div>
              <div className="sidebar-profile-meta">
                <strong>{profile.fullName || role}</strong>
                <p>{profile.role ? profile.role.toUpperCase() : role.toUpperCase()}</p>
              </div>
            </div>
          ) : null}

          <nav className="sidebar-nav">
            <span className="sidebar-section-title">Dashboard</span>
            <NavLink
              to={basePath}
              end
              aria-label="Overview"
            >
              <span></span>
              Overview
            </NavLink>

            {dashboardLinks.map((item) => (
              <NavLink
                className="sidebar-sub-link"
                to={item.to}
                key={item.label}
                aria-label={item.label}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            {workspaceItems.length ? <span className="sidebar-section-title">Workspace</span> : null}
            {workspaceItems.map((item) => (
              <NavLink
                className="sidebar-sub-link"
                to={item.to}
                key={item.label}
                aria-label={item.label}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-card">
            <span>Workspace</span>
            <strong>{role}</strong>
            <p>Complaint operations center</p>
          </div>

          {onLogout ? (
            <button className="sidebar-logout" type="button" onClick={onLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-navbar">
          <div>
            <span className="dashboard-kicker">{role} Dashboard</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>

        <motion.main
          className="dashboard-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export default DashboardLayout;
