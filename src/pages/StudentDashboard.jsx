import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import "../styles/admin.css";
import {
  DataTable,
  DonutChart,
  GlassPanel,
  ProfileCard,
  QuickActions,
  RecentActivity,
  StatCards,
  WelcomeBanner,
} from "../components/dashboard/DashboardWidgets.jsx";
import { Link, useParams, useNavigate } from "react-router-dom";
import { get, post, put, patch, clearToken } from "../utils/apiClient.js";

const complaintColumns = [
  { key: "complaintId", label: "ID" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
];

const complaintCategories = [
  "Electrical",
  "Plumbing",
  "Network",
  "Housekeeping",
  "Cleaning",
  "Other",
];

const dashboardLinks = [
  { label: "Statistics", to: "/student-dashboard/statistics" },
  { label: "Profile Settings", to: "/student-dashboard/profile" },
  { label: "Submit Complaint", to: "/student-dashboard/complaint-status" },
  { label: "My Complaints", to: "/student-dashboard/recent-complaints" },
  { label: "Feedback", to: "/student-dashboard/feedback" },
  { label: "Notifications", to: "/student-dashboard/recent-activity" },
];

function StudentDashboard() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    profile: {
      fullName: "Student",
      rollNumber: "-",
      roomNumber: "-",
      email: "-",
      phoneNumber: "",
      profileImageUrl: undefined,
    },
    recentComplaints: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [complaintForm, setComplaintForm] = useState({
    complaintTitle: "",
    category: "",
    roomNumber: "",
    description: "",
    image: null,
  });
  const [feedbackForm, setFeedbackForm] = useState({
    complaintId: "",
    rating: 5,
    feedbackMessage: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [stats, profile, complaints, notifications] = await Promise.all([
          get("/student/dashboard"),
          get("/student/profile"),
          get("/student/complaints"),
          get("/student/notifications"),
        ]);

        if (!isMounted) return;

        setData({
          totalComplaints: stats.totalComplaints || 0,
          pendingComplaints: stats.pendingComplaints || 0,
          inProgressComplaints: stats.inProgressComplaints || 0,
          resolvedComplaints: stats.resolvedComplaints || 0,
          profile: {
            fullName: profile.fullName || "Student",
            rollNumber: profile.rollNumber || "-",
            roomNumber: profile.roomNumber || "-",
            email: profile.email || "-",
            phoneNumber: profile.phoneNumber || "",
            profileImageUrl: profile.profileImageUrl,
          },
          recentComplaints: complaints.map((complaint) => ({
            complaintId: complaint.complaintId || complaint._id,
            title: complaint.complaintTitle || complaint.title || "Complaint",
            category: complaint.category || "-",
            date: new Date(complaint.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: complaint.status || "Pending",
            complaintIdValue: complaint._id,
          })),
        });
        setNotifications(notifications);
        setProfileForm({
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || "",
          password: "",
          confirmPassword: "",
        });
        setFeedbackForm((current) => ({
          ...current,
          complaintId: complaints.find((item) => item.status?.toLowerCase() === "resolved")?.complaintIdValue || "",
        }));
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.message || "Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: "Total Complaints", value: data.totalComplaints, caption: "All submitted requests" },
    { label: "Pending Complaints", value: data.pendingComplaints, caption: "Waiting for review", tone: "warning" },
    { label: "In Progress Complaints", value: data.inProgressComplaints, caption: "Being handled", tone: "info" },
    { label: "Resolved Complaints", value: data.resolvedComplaints, caption: "Closed successfully", tone: "success" },
  ];

  const chartData = [
    { label: "Pending", value: data.pendingComplaints, color: "#f59e0b" },
    { label: "In Progress", value: data.inProgressComplaints, color: "#2563eb" },
    { label: "Resolved", value: data.resolvedComplaints, color: "#10b981" },
  ];

  const actions = [
    { label: "Submit Complaint", description: "Create a new hostel issue", to: "/student-dashboard/complaint-status" },
    { label: "View My Complaints", description: "Track every request", to: "/student-dashboard/recent-complaints" },
    { label: "Notifications", description: "Read latest updates", to: "/student-dashboard/recent-activity" },
    { label: "Feedback", description: "Rate completed work", to: "/student-dashboard/feedback" },
  ];

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  function handleProfileCancel() {
    setProfileSuccess("");
    setProfileError("");
    setProfileForm({
      email: data.profile.email || "",
      phoneNumber: data.profile.phoneNumber || "",
      password: "",
      confirmPassword: "",
    });
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    try {
      if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
        setProfileError("Passwords do not match.");
        return;
      }

      const formData = new FormData();
      formData.append("email", profileForm.email);
      formData.append("phoneNumber", profileForm.phoneNumber);
      if (profileForm.password) {
        formData.append("password", profileForm.password);
      }

      const updated = await put("/student/profile", formData);
      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          email: updated.email || current.profile.email,
          phoneNumber: updated.phoneNumber || current.profile.phoneNumber,
        },
      }));
      setProfileForm({
        email: updated.email || profileForm.email,
        phoneNumber: updated.phoneNumber || profileForm.phoneNumber,
        password: "",
        confirmPassword: "",
      });
      setProfileSuccess("Profile settings updated successfully.");
      setProfileError("");
    } catch (submitErr) {
      setProfileError(submitErr.message || "Could not update profile.");
    }
  }

  async function handleComplaintSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("complaintTitle", complaintForm.complaintTitle);
      formData.append("category", complaintForm.category);
      formData.append("roomNumber", complaintForm.roomNumber);
      formData.append("description", complaintForm.description);
      if (complaintForm.image) {
        formData.append("image", complaintForm.image);
      }

      const complaint = await post("/student/complaints", formData);
      setData((current) => ({
        ...current,
        totalComplaints: current.totalComplaints + 1,
        pendingComplaints: current.pendingComplaints + 1,
        recentComplaints: [
          {
            complaintId: complaint._id,
            title: complaint.complaintTitle || "Complaint",
            category: complaint.category || "-",
            date: new Date(complaint.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: complaint.status || "Pending",
            complaintIdValue: complaint._id,
          },
          ...current.recentComplaints,
        ],
      }));
      setComplaintForm({ complaintTitle: "", category: "", roomNumber: "", description: "", image: null });
      setSuccessMessage("Complaint submitted successfully.");
    } catch (submitErr) {
      setSubmitError(submitErr.message || "Could not submit complaint.");
    }
  }

  async function handleNotificationRead(notificationId) {
    try {
      await patch(`/student/notifications/${notificationId}/read`, {});
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (notificationErr) {
      setSubmitError(notificationErr.message || "Could not mark notification as read.");
    }
  }

  async function handleFeedbackSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    try {
      await post("/student/feedback", {
        complaintId: feedbackForm.complaintId,
        rating: Number(feedbackForm.rating),
        feedbackMessage: feedbackForm.feedbackMessage,
      });
      setFeedbackForm((current) => ({ ...current, feedbackMessage: "" }));
      setSuccessMessage("Feedback submitted successfully.");
    } catch (submitErr) {
      setSubmitError(submitErr.message || "Could not submit feedback.");
    }
  }

  const activityItems = notifications.slice(0, 6).map((notification) => ({
    title: notification.message,
    description: notification.isRead ? "Read update" : "New activity",
    time: new Date(notification.createdAt).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }),
    tone: notification.isRead ? "" : "info",
    id: notification._id,
    isRead: notification.isRead,
  }));

  const resolvedComplaints = data.recentComplaints.filter(
    (complaint) => complaint.status?.toLowerCase() === "resolved"
  );

  const profileSection = (
    <div className="dashboard-page-content">
      <GlassPanel title="Profile Settings" subtitle="Manage your student contact and account settings">
        <form className="profile-settings-form" onSubmit={handleProfileSubmit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              autoComplete="tel"
              value={profileForm.phoneNumber}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
              value={profileForm.password}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={profileForm.confirmPassword}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            />
          </label>
          <div className="form-actions profile-settings-actions">
            <button className="primary" type="submit">
              Save changes
            </button>
            <button className="secondary" type="button" onClick={handleProfileCancel}>
              Reset
            </button>
          </div>
          {profileSuccess ? <div className="form-success">{profileSuccess}</div> : null}
          {profileError ? <div className="form-error">{profileError}</div> : null}
        </form>
      </GlassPanel>
    </div>
  );

  const complaintSection = (
    <div className="dashboard-page-content">
      <GlassPanel title="Submit Complaint" subtitle="Report a hostel issue">
        <form className="login-form" onSubmit={handleComplaintSubmit}>
          <label>
            Complaint title
            <input
              type="text"
              value={complaintForm.complaintTitle}
              onChange={(event) => setComplaintForm((prev) => ({ ...prev, complaintTitle: event.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <select
              value={complaintForm.category}
              onChange={(event) => setComplaintForm((prev) => ({ ...prev, category: event.target.value }))}
              required
            >
              <option value="">Select category</option>
              {complaintCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room number
            <input
              type="number"
              value={complaintForm.roomNumber}
              onChange={(event) => setComplaintForm((prev) => ({ ...prev, roomNumber: event.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={complaintForm.description}
              onChange={(event) => setComplaintForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={6}
              required
            />
          </label>
          <label>
            Add image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setComplaintForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
            />
          </label>
          <button className="button primary full" type="submit">
            Submit complaint
          </button>
        </form>
        {successMessage ? <div className="dashboard-success">{successMessage}</div> : null}
        {submitError ? <div className="dashboard-error">{submitError}</div> : null}
      </GlassPanel>
    </div>
  );

  const recentComplaintsSection = (
    <GlassPanel title="My Complaints" subtitle="Your complaint history">
      <DataTable columns={complaintColumns} rows={data.recentComplaints} />
    </GlassPanel>
  );

  const notificationsSection = (
    <GlassPanel title="Notifications" subtitle="Latest updates and status changes">
      <div className="activity-list">
        {activityItems.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          activityItems.map((item) => (
            <div className="activity-item" key={item.id}>
              <span className={`activity-dot ${item.tone || ""}`} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <time>{item.time}</time>
              {!item.isRead ? (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => handleNotificationRead(item.id)}
                >
                  Mark as read
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
      {submitError ? <div className="dashboard-error">{submitError}</div> : null}
    </GlassPanel>
  );

  const feedbackSection = (
    <GlassPanel title="Feedback" subtitle="Share your experience after resolution">
      <form className="login-form" onSubmit={handleFeedbackSubmit}>
        <label>
          Resolved complaint
          <select
            value={feedbackForm.complaintId}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, complaintId: event.target.value }))}
            required
          >
            <option value="">Select complaint</option>
            {resolvedComplaints.map((complaint) => (
              <option key={complaint.complaintIdValue} value={complaint.complaintIdValue}>
                {complaint.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rating
          <select
            value={feedbackForm.rating}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, rating: event.target.value }))}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Feedback message
          <textarea
            value={feedbackForm.feedbackMessage}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, feedbackMessage: event.target.value }))}
            rows={5}
          />
        </label>
        <button className="button primary full" type="submit">
          Send feedback
        </button>
      </form>
      {successMessage ? <div className="dashboard-success">{successMessage}</div> : null}
      {submitError ? <div className="dashboard-error">{submitError}</div> : null}
    </GlassPanel>
  );

  const sectionPages = {
    statistics: {
      title: "Statistics",
      subtitle: "Complaint totals and current progress",
      content: <StatCards stats={stats} />,
    },
    profile: {
      title: "Profile Settings",
      subtitle: "Manage your student contact and account settings",
      content: profileSection,
    },
    "complaint-status": {
      title: "Submit Complaint",
      subtitle: "Report a hostel issue",
      content: complaintSection,
    },
    "recent-complaints": {
      title: "My Complaints",
      subtitle: "Your complaint history",
      content: recentComplaintsSection,
    },
    "quick-actions": {
      title: "Quick Actions",
      subtitle: "Common student tasks",
      content: (
        <GlassPanel title="Quick Actions" subtitle="Common student tasks">
          <QuickActions actions={actions} />
        </GlassPanel>
      ),
    },
    "recent-activity": {
      title: "Notifications",
      subtitle: "Live updates from your complaint flow",
      content: notificationsSection,
    },
    feedback: {
      title: "Feedback",
      subtitle: "Share your experience after resolution",
      content: feedbackSection,
    },
  };

  const activeSection = sectionPages[section];

  if (loading) {
    return (
      <DashboardLayout
        role="Student"
        title="Loading dashboard..."
        subtitle="Fetching the latest student data."
        dashboardLinks={dashboardLinks}
        sidebarProfile={data.profile}
        onLogout={handleLogout}
      >
        <div className="dashboard-loading">Loading student dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        role="Student"
        title="Dashboard error"
        subtitle="We could not load your dashboard right now."
        dashboardLinks={dashboardLinks}
        sidebarProfile={data.profile}
        onLogout={handleLogout}
      >
        <div className="dashboard-error">{error}</div>
      </DashboardLayout>
    );
  }

  if (activeSection) {
    return (
      <DashboardLayout
        role="Student"
        title={activeSection.title}
        subtitle={activeSection.subtitle}
        dashboardLinks={dashboardLinks}
        sidebarProfile={data.profile}
        onLogout={handleLogout}
      >
        <Link className="dashboard-back-link" to="/student-dashboard">
          Back to Overview
        </Link>
        <div className="dashboard-detail-page">{activeSection.content}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="Student"
      title="Your complaint workspace"
      subtitle="Track hostel issues, maintenance progress, and feedback from one polished view."
      dashboardLinks={dashboardLinks}
      onLogout={handleLogout}
    >
      <WelcomeBanner
        name={`Hello, ${data.profile.fullName}`}
        message="Your dashboard is updated with the latest complaint activity and room service progress."
        actionLabel="Submit Complaint"
        actionTo="/student-dashboard/complaint-status"
      />

      <StatCards stats={stats} to="/student-dashboard/statistics" />

      <div className="dashboard-two-column">
        <ProfileCard student={data.profile} to="/student-dashboard/profile" />
        <GlassPanel
          title="Complaint Status"
          subtitle="Current distribution"
          to="/student-dashboard/complaint-status"
        >
          <DonutChart data={chartData} />
        </GlassPanel>
      </div>

      <div className="dashboard-two-column wide-left">
        <GlassPanel
          title="Recent Complaints"
          subtitle="Latest complaint records"
          to="/student-dashboard/recent-complaints"
        >
          <DataTable columns={complaintColumns} rows={data.recentComplaints} />
        </GlassPanel>
        <GlassPanel
          title="Quick Actions"
          subtitle="Common student tasks"
          to="/student-dashboard/quick-actions"
        >
          <QuickActions actions={actions} />
        </GlassPanel>
      </div>

      <GlassPanel
        title="Recent Activity"
        subtitle="Live updates from your complaint flow"
        to="/student-dashboard/recent-activity"
      >
        <RecentActivity items={activityItems} />
      </GlassPanel>
    </DashboardLayout>
  );
}

export default StudentDashboard;
