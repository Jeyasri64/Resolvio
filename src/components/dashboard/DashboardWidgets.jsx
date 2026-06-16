import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const panelMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: "easeOut" },
};

export function WelcomeBanner({ name, message, actionLabel, actionTo }) {
  const navigate = useNavigate();
  const handleAction = () => {
    if (actionTo) navigate(actionTo);
  };

  return (
    <motion.section className="welcome-banner" {...panelMotion}>
      <div>
        <span className="dashboard-kicker">Welcome back</span>
        <h2>{name}</h2>
        <p>{message}</p>
      </div>
      <button className="dashboard-action primary" type="button" onClick={handleAction}>
        <span>+</span>
        {actionLabel}
      </button>
    </motion.section>
  );
}

export function StatCards({ stats, to }) {
  const [animationRun, setAnimationRun] = useState(0);
  const navigate = useNavigate();
  const isClickable = Boolean(to);
  const handleNavigate = () => {
    if (to) navigate(to);
  };
  const handleKeyDown = (event) => {
    if (!to || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <motion.section
      className={`dashboard-stats ${isClickable ? "clickable-stats" : ""}`}
      aria-label="Complaint statistics"
      onClick={isClickable ? handleNavigate : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      onViewportEnter={() => setAnimationRun((run) => run + 1)}
      onViewportLeave={() => setAnimationRun(0)}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      viewport={{ once: false, amount: 0.35 }}
    >
      {stats.map((stat, index) => (
        <motion.article
          className={`glass-card stat-card ${stat.tone || ""}`}
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.42, ease: "easeOut" }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <span>{stat.label}</span>
          <AnimatedNumber value={stat.value} animationRun={animationRun} />
          <small>{stat.caption}</small>
        </motion.article>
      ))}
    </motion.section>
  );
}

export function GlassPanel({ title, subtitle, children, className = "", to }) {
  const navigate = useNavigate();
  const isClickable = Boolean(to);
  const handleNavigate = () => {
    if (to) navigate(to);
  };
  const handleKeyDown = (event) => {
    if (!to || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <motion.section
      className={`glass-card dashboard-panel ${isClickable ? "clickable-panel" : ""} ${className}`}
      onClick={isClickable ? handleNavigate : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...panelMotion}
    >
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export function ProfileCard({ student, to }) {
  return (
    <GlassPanel title="Student Profile" subtitle="Hostel resident information" to={to}>
      <div className="profile-card">
        {student.profileImageUrl ? (
          <img className="profile-avatar" src={student.profileImageUrl} alt={`${student.fullName} avatar`} />
        ) : (
          <div className="profile-avatar">{student.fullName.slice(0, 1)}</div>
        )}
        <div>
          <h3>{student.fullName}</h3>
          <p>{student.email}</p>
        </div>
      </div>

      <dl className="profile-details">
        <div>
          <dt>Roll Number</dt>
          <dd>{student.rollNumber}</dd>
        </div>
        <div>
          <dt>Room Number</dt>
          <dd>{student.roomNumber}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{student.email}</dd>
        </div>
      </dl>
    </GlassPanel>
  );
}

export function DataTable({ columns, rows, onRowClick, actions }) {
  return (
    <div className="table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || row._id || row.complaintId || row.rollNumber || rowIndex}
              className={onRowClick ? 'clickable-row' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(row);
                }
              } : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} data-label={column.label}>
                  {column.render ? (
                    column.render(row)
                  ) : column.key === "status" ? (
                    <StatusBadge status={row[column.key]} />
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
              {actions ? (
                <td data-label="Actions" onClick={(event) => event.stopPropagation()}>
                  <div className="table-actions">{actions(row)}</div>
                </td>
              ) : null}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="empty-table-cell" colSpan={columns.length + (actions ? 1 : 0)}>
                No records found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function QuickActions({ actions }) {
  const navigate = useNavigate();
  const handleClick = (event, to) => {
    event.preventDefault();
    if (to) navigate(to);
  };

  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <button
          className="quick-action"
          type="button"
          key={action.label}
          onClick={(event) => handleClick(event, action.to)}
        >
          <span>{action.icon}</span>
          <strong>{action.label}</strong>
          <small>{action.description}</small>
        </button>
      ))}
    </div>
  );
}

export function RecentActivity({ items }) {
  return (
    <div className="activity-list">
      {items.map((item) => (
        <div className="activity-item" key={`${item.title}-${item.time}`}>
          <span className={`activity-dot ${item.tone || ""}`} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
          <time>{item.time}</time>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = total || 1;
  let offset = 25;

  return (
    <div className="chart-layout">
      <svg className="donut-chart" viewBox="0 0 42 42" role="img" aria-label="Complaint status chart">
        <circle className="donut-track" cx="21" cy="21" r="15.915" />
        {data.map((item) => {
          const segment = (item.value / safeTotal) * 100;
          const currentOffset = offset;
          offset -= segment;
          return (
            <circle
              className="donut-segment"
              cx="21"
              cy="21"
              key={item.label}
              r="15.915"
              stroke={item.color}
              strokeDasharray={`${segment} ${100 - segment}`}
              strokeDashoffset={currentOffset}
            />
          );
        })}
        <text x="21" y="19.5" textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x="21" y="24.5" textAnchor="middle" className="donut-label">
          Total
        </text>
      </svg>

      <div className="chart-legend">
        {data.map((item) => (
          <div key={item.label}>
            <span style={{ background: item.color }} />
            <strong>{item.label}</strong>
            <small>{item.value}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="bar-chart" role="img" aria-label="Complaint analytics chart">
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track">
            <motion.span
              style={{ background: item.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / maxValue) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.72, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${normalized}`}>{status}</span>;
}

function AnimatedNumber({ value, animationRun }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animationRun) {
      setDisplayValue(0);
      return undefined;
    }

    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldReduceMotion) {
      setDisplayValue(value);
      return undefined;
    }

    const duration = 950;
    const startTime = performance.now();
    let frameId;

    setDisplayValue(0);

    const updateValue = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateValue);
      }
    };

    frameId = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(frameId);
  }, [animationRun, value]);

  return <strong>{displayValue}</strong>;
}
