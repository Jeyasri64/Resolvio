import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import "../styles/admin.css";
import {
  BarChart,
  DataTable,
  GlassPanel,
  QuickActions,
  StatCards,
  WelcomeBanner,
} from "../components/dashboard/DashboardWidgets.jsx";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { clearToken, del, get, getToken, patch, post, put } from "../utils/apiClient.js";

const complaintColumns = [
  { key: "complaintId", label: "ID" },
  { key: "studentName", label: "Student" },
  { key: "roomNumber", label: "Room" },
  { key: "category", label: "Category" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated" },
];

const userColumns = [
  { key: "fullName", label: "Name" },
  { key: "rollNumber", label: "Roll" },
  { key: "roomNumber", label: "Room" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
];

const dashboardLinks = [
  { label: "Complaints", to: "/admin-dashboard/complaints" },
  { label: "Categories", to: "/admin-dashboard/categories" },
  { label: "Users", to: "/admin-dashboard/users" },
  { label: "Analytics", to: "/admin-dashboard/analytics" },
  { label: "Messages", to: "/admin-dashboard/messages" },
  { label: "Feedback", to: "/admin-dashboard/feedback" },
  { label: "Profile", to: "/admin-dashboard/settings" },
];

function AdminDashboard() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    recentComplaints: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminProfile, setAdminProfile] = useState({
    fullName: "Admin",
    email: "-",
    roomNumber: "-",
    phoneNumber: "",
    profileImageUrl: undefined,
  });
  const [adminProfileForm, setAdminProfileForm] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isAdminProfileEditing, setIsAdminProfileEditing] = useState(false);
  const [adminProfileError, setAdminProfileError] = useState(null);
  const [adminProfileSuccess, setAdminProfileSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [newCategory, setNewCategory] = useState({ categoryName: "", description: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState({ categoryName: "", description: "" });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const handleLogout = useCallback(() => {
    clearToken();
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [stats, complaints, users, profile] = await Promise.all([
          get('/admin/dashboard'),
          get('/admin/complaints'),
          get('/admin/users'),
          get('/admin/profile'),
        ]);

        if (!isMounted) return;

        setData({
          totalComplaints: stats.totalComplaints || 0,
          pendingComplaints: stats.pendingComplaints || 0,
          inProgressComplaints: stats.inProgressComplaints || 0,
          resolvedComplaints: stats.resolvedComplaints || 0,
          rejectedComplaints: stats.rejectedComplaints || 0,
          recentComplaints: complaints.map((complaint) => ({
            id: complaint.complaintId || complaint._id,
            complaintId: complaint.complaintId || complaint._id,
            studentName: complaint.student?.fullName || complaint.student?.name || 'Unknown',
            roomNumber: complaint.roomNumber || '-',
            category: complaint.category || '-',
            title: complaint.complaintTitle || complaint.title || 'Complaint',
            status: complaint.status || 'Pending',
            updatedAt: new Date(complaint.updatedAt || complaint.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          })),
          recentUsers: users.map((user) => ({
            id: user._id,
            fullName: user.fullName || 'Unknown',
            rollNumber: user.rollNumber || '-',
            roomNumber: user.roomNumber || '-',
            email: user.email || '-',
            role: user.role || 'Student',
            status: user.status || 'active',
          })),
        });

        setAdminProfile({
          fullName: profile.fullName || 'Admin',
          email: profile.email || '-',
          roomNumber: profile.roomNumber || '-',
          phoneNumber: profile.phoneNumber || '',
          profileImageUrl: profile.profileImageUrl,
        });
        setAdminProfileForm({
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          password: '',
          confirmPassword: '',
        });
      } catch (fetchError) {
        if (!isMounted) return;
        if (fetchError.status === 401 || fetchError.status === 403) {
          handleLogout();
          return;
        }
        setError(fetchError.message || 'Failed to load admin dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminDashboard();

    return () => {
      isMounted = false;
    };
  }, [handleLogout]);

  useEffect(() => {
    if (section !== 'categories') return;
    let isMounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const categoryList = await get('/categories');
        if (!isMounted) return;
        setCategories(categoryList);
      } catch (fetchError) {
        if (!isMounted) return;
        if (fetchError.status === 401 || fetchError.status === 403) {
          handleLogout();
          return;
        }
        setCategoriesError(fetchError.message || 'Could not load categories');
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [section, handleLogout]);

  useEffect(() => {
    if (section !== 'feedback') return;
    let isMounted = true;

    async function loadFeedback() {
      setFeedbackLoading(true);
      setFeedbackError(null);

      try {
        const feedbackList = await get('/admin/feedback');
        if (!isMounted) return;
        setFeedback(feedbackList.map((item) => ({
          id: item._id,
          studentName: item.student?.fullName || 'Unknown',
          complaint: item.complaint?.complaintTitle || 'Complaint',
          rating: item.rating,
          feedbackMessage: item.feedbackMessage || '-',
          status: item.complaint?.status || '-',
        })));
      } catch (fetchError) {
        if (!isMounted) return;
        if (fetchError.status === 401 || fetchError.status === 403) {
          handleLogout();
          return;
        }
        setFeedbackError(fetchError.message || 'Could not load feedback');
      } finally {
        if (isMounted) setFeedbackLoading(false);
      }
    }

    loadFeedback();

    return () => {
      isMounted = false;
    };
  }, [section, handleLogout]);

  async function handleAdminProfileSubmit(event) {
    event.preventDefault();
    setAdminProfileError(null);
    setAdminProfileSuccess(null);

    if (adminProfileForm.password && adminProfileForm.password !== adminProfileForm.confirmPassword) {
      setAdminProfileError('Passwords do not match.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', adminProfileForm.email);
      formData.append('phoneNumber', adminProfileForm.phoneNumber);
      if (adminProfileForm.password) {
        formData.append('password', adminProfileForm.password);
      }

      const updated = await put('/admin/profile', formData);
      setAdminProfile({
        fullName: updated.fullName || adminProfile.fullName,
        email: updated.email || adminProfile.email,
        roomNumber: updated.roomNumber || adminProfile.roomNumber,
        phoneNumber: updated.phoneNumber || adminProfile.phoneNumber,
        profileImageUrl: updated.profileImageUrl,
      });
      setAdminProfileForm({
        email: updated.email || adminProfileForm.email,
        phoneNumber: updated.phoneNumber || adminProfileForm.phoneNumber,
        password: '',
        confirmPassword: '',
      });
      setAdminProfileSuccess('Profile updated successfully.');
      setIsAdminProfileEditing(false);
    } catch (submitErr) {
      setAdminProfileError(submitErr.message || 'Could not update profile.');
    }
  }

  function handleAdminProfileEdit() {
    setAdminProfileForm({
      email: adminProfile.email || '',
      phoneNumber: adminProfile.phoneNumber || '',
      password: '',
      confirmPassword: '',
    });
    setAdminProfileError(null);
    setAdminProfileSuccess(null);
    setIsAdminProfileEditing(true);
  }

  function handleAdminProfileCancel() {
    setAdminProfileForm({
      email: adminProfile.email || '',
      phoneNumber: adminProfile.phoneNumber || '',
      password: '',
      confirmPassword: '',
    });
    setAdminProfileError(null);
    setAdminProfileSuccess(null);
    setIsAdminProfileEditing(false);
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    setCategoriesError(null);

    if (!newCategory.categoryName.trim()) {
      setCategoriesError('Category name is required');
      return;
    }

    try {
      const created = await post('/categories', newCategory);
      setCategories((prev) => [created, ...prev]);
      setNewCategory({ categoryName: '', description: '' });
      setIsCategoryModalOpen(false);
    } catch (submitErr) {
      setCategoriesError(submitErr.message || 'Could not create category.');
    }
  }

  function openCreateCategoryModal() {
    setCategoriesError(null);
    setEditingCategoryId(null);
    setEditingCategory({ categoryName: '', description: '' });
    setNewCategory({ categoryName: '', description: '' });
    setIsCategoryModalOpen(true);
  }

  function startEditingCategory(category) {
    setCategoriesError(null);
    setEditingCategoryId(category._id);
    setEditingCategory({
      categoryName: category.categoryName || '',
      description: category.description || '',
    });
    setIsCategoryModalOpen(true);
  }

  function cancelEditingCategory() {
    setEditingCategoryId(null);
    setEditingCategory({ categoryName: '', description: '' });
    setIsCategoryModalOpen(false);
    setCategoriesError(null);
  }

  async function handleUpdateCategory(event) {
    event.preventDefault();
    if (!editingCategoryId) return;

    setCategoriesError(null);
    if (!editingCategory.categoryName.trim()) {
      setCategoriesError('Category name is required');
      return;
    }

    try {
      const updated = await put(`/categories/${editingCategoryId}`, editingCategory);
      setCategories((prev) => prev.map((category) => (
        category._id === updated._id ? updated : category
      )));
      cancelEditingCategory();
    } catch (submitErr) {
      setCategoriesError(submitErr.message || 'Could not update category.');
    }
  }

  async function handleDeleteCategory(categoryId) {
    const confirmed = window.confirm('Delete this category? Existing complaints will keep their saved category text.');
    if (!confirmed) return;

    setCategoriesError(null);
    try {
      await del(`/categories/${categoryId}`);
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
      if (editingCategoryId === categoryId) cancelEditingCategory();
    } catch (deleteErr) {
      setCategoriesError(deleteErr.message || 'Could not delete category.');
    }
  }

  async function handleComplaintStatusChange(complaintId, status) {
    try {
      const updated = await patch(`/admin/complaints/${complaintId}`, { status });
      setData((prev) => ({
        ...prev,
        recentComplaints: prev.recentComplaints.map((complaint) => (
          complaint.id === complaintId
            ? {
                ...complaint,
                status: updated.status || status,
                updatedAt: new Date(updated.updatedAt || Date.now()).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : complaint
        )),
      }));
    } catch (updateErr) {
      alert(updateErr.message || 'Could not update complaint.');
    }
  }

  async function handleUserStatusChange(userId, status) {
    try {
      const updated = await patch(`/admin/users/${userId}/status`, { status });
      setData((prev) => ({
        ...prev,
        recentUsers: prev.recentUsers.map((user) => (
          user.id === userId ? { ...user, status: updated.status || status } : user
        )),
      }));
    } catch (updateErr) {
      alert(updateErr.message || 'Could not update user.');
    }
  }

  const stats = [
    { label: "Total Complaints", value: data.totalComplaints,  caption: "Across all hostels" },
    { label: "Pending Complaints", value: data.pendingComplaints,  caption: "Needs triage", tone: "warning" },
    { label: "In Progress Complaints", value: data.inProgressComplaints, caption: "Assigned work", tone: "info" },
    { label: "Resolved Complaints", value: data.resolvedComplaints,  caption: "Completed cases", tone: "success" },
    { label: "Rejected Complaints", value: data.rejectedComplaints,  caption: "Closed without action", tone: "danger" },
  ];

  const chartData = [
    { label: "Pending Complaints", value: data.pendingComplaints, color: "#f59e0b" },
    { label: "In Progress Complaints", value: data.inProgressComplaints, color: "#2563eb" },
    { label: "Resolved Complaints", value: data.resolvedComplaints, color: "#10b981" },
    { label: "Rejected Complaints", value: data.rejectedComplaints, color: "#ef4444" },
  ];

  const actions = [
    { label: "Manage Complaints", description: "Assign and update tickets", to: "/admin-dashboard/complaints" },
    { label: "Manage Categories", description: "Edit complaint groups", to: "/admin-dashboard/categories" },
    { label: "Manage Users", description: "Review student access", to: "/admin-dashboard/users" },
    { label: "View Analytics", description: "Review performance data", to: "/admin-dashboard/analytics" },
  ];

  const sectionPages = {
    settings: {
      title: "Profile",
      subtitle: "View and update your admin account details",
      content: (
        <GlassPanel title="Profile" subtitle="Your saved admin profile details">
          <div className="profile-settings-page">
            {!isAdminProfileEditing ? (
              <section className="admin-profile-view" aria-label="Saved profile details">
                <div className="admin-profile-view-header">
                  <div className="admin-profile-avatar-large">
                    {adminProfile.profileImageUrl ? (
                      <img src={adminProfile.profileImageUrl} alt={`${adminProfile.fullName} avatar`} />
                    ) : (
                      <span>{adminProfile.fullName?.slice(0, 1) || 'A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="profile-view-kicker">Admin Profile</span>
                    <h3>{adminProfile.fullName || 'Admin'}</h3>
                    <p>{adminProfile.email || '-'}</p>
                  </div>
                  <button className="profile-edit-button" type="button" onClick={handleAdminProfileEdit}>
                    Edit
                  </button>
                </div>

                <dl className="admin-profile-detail-grid">
                  <div>
                    <dt>Full Name</dt>
                    <dd>{adminProfile.fullName || '-'}</dd>
                  </div>
                  <div>
                    <dt>Email Address</dt>
                    <dd>{adminProfile.email || '-'}</dd>
                  </div>
                  <div>
                    <dt>Phone Number</dt>
                    <dd>{adminProfile.phoneNumber || '-'}</dd>
                  </div>
                  <div>
                    <dt>Room Number</dt>
                    <dd>{adminProfile.roomNumber || '-'}</dd>
                  </div>
                </dl>
              </section>
            ) : (
              <form className="profile-settings-form profile-edit-mode" onSubmit={handleAdminProfileSubmit}>
                <div className="profile-form-heading">
                  <span className="profile-view-kicker">Edit Profile</span>
                  <h3>Update Account Details</h3>
                </div>

                <label>
                  Email address
                  <input
                    type="email"
                    autoComplete="email"
                    value={adminProfileForm.email}
                    onChange={(event) => setAdminProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>

                <label>
                  Phone number
                  <input
                    type="text"
                    autoComplete="tel"
                    value={adminProfileForm.phoneNumber}
                    onChange={(event) => setAdminProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  />
                </label>

                <label>
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                    value={adminProfileForm.password}
                    onChange={(event) => setAdminProfileForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={adminProfileForm.confirmPassword}
                    onChange={(event) => setAdminProfileForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  />
                </label>

                <div className="form-actions profile-settings-actions">
                  <button className="primary" type="submit">Save changes</button>
                  <button className="secondary" type="button" onClick={handleAdminProfileCancel}>Cancel</button>
                </div>

                {adminProfileError ? <div className="form-error">{adminProfileError}</div> : null}
              </form>
            )}
          </div>
        </GlassPanel>
      ),
    },
    analytics: {
      title: "Analytics",
      subtitle: "Status-wise operational load",
      content: (
        <GlassPanel title="Analytics" subtitle="Status-wise operational load">
          <StatCards stats={stats} />
          <BarChart data={chartData} />
        </GlassPanel>
      ),
    },
    categories: {
      title: "Manage Categories",
      subtitle: "Complaint categories maintained by the admin",
      content: (
        <GlassPanel title="Manage Categories" subtitle="Complaint categories maintained by the admin">
          <div className="category-management modern-category-page">
            <div className="category-toolbar">
              <div>
                <span className="category-count">{categories.length} categories</span>
                <h3>Complaint Category Library</h3>
                <p>Keep category names clear so complaints are routed and reviewed faster.</p>
              </div>

              <button className="category-add-button" type="button" onClick={openCreateCategoryModal}>
                <span>+</span>
                Add Category
              </button>
            </div>

            {isCategoryModalOpen ? (
              <div className="category-modal-backdrop" role="presentation" onMouseDown={cancelEditingCategory}>
                <div
                  className="category-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="category-modal-title"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="category-modal-header">
                    <div>
                      <span>{editingCategoryId ? 'Edit category' : 'New category'}</span>
                      <h3 id="category-modal-title">
                        {editingCategoryId ? 'Update Category' : 'Add Category'}
                      </h3>
                    </div>
                    <button className="modal-close-button" type="button" aria-label="Close category form" onClick={cancelEditingCategory}>
                      x
                    </button>
                  </div>

                  <form className="category-modal-form" onSubmit={editingCategoryId ? handleUpdateCategory : handleCreateCategory}>
                    <label>
                      Category Name
                      <input
                        type="text"
                        placeholder="Example: Electrical"
                        value={editingCategoryId ? editingCategory.categoryName : newCategory.categoryName}
                        onChange={(event) => (
                          editingCategoryId
                            ? setEditingCategory((prev) => ({ ...prev, categoryName: event.target.value }))
                            : setNewCategory((prev) => ({ ...prev, categoryName: event.target.value }))
                        )}
                        autoFocus
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        rows="4"
                        placeholder="Describe when this category should be used"
                        value={editingCategoryId ? editingCategory.description : newCategory.description}
                        onChange={(event) => (
                          editingCategoryId
                            ? setEditingCategory((prev) => ({ ...prev, description: event.target.value }))
                            : setNewCategory((prev) => ({ ...prev, description: event.target.value }))
                        )}
                      />
                    </label>

                    {categoriesError ? <div className="form-error">{categoriesError}</div> : null}

                    <div className="category-modal-actions">
                      <button className="secondary" type="button" onClick={cancelEditingCategory}>Cancel</button>
                      <button className="primary" type="submit">
                        {editingCategoryId ? 'Save Changes' : 'Create Category'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}

            {categoriesLoading ? (
              <div className="category-table-state">Loading categories...</div>
            ) : categoriesError && !isCategoryModalOpen ? (
              <div className="form-error">{categoriesError}</div>
            ) : (
              <div className="category-table-card">
                <DataTable
                  columns={[
                    { key: "categoryName", label: "Category" },
                    { key: "description", label: "Description" },
                  ]}
                  rows={categories}
                  actions={(category) => (
                    <>
                      <button className="table-action edit" type="button" onClick={() => startEditingCategory(category)}>
                        Edit
                      </button>
                      <button className="table-action delete" type="button" onClick={() => handleDeleteCategory(category._id)}>
                        Delete
                      </button>
                    </>
                  )}
                />
              </div>
            )}
          </div>
        </GlassPanel>
      ),
    },
    messages: {
      title: "Messages",
      subtitle: "Recent complaint updates that may need admin attention",
      content: (
        <GlassPanel title="Messages" subtitle="Recent complaint updates that may need admin attention">
          <div className="activity-list">
            {data.recentComplaints.slice(0, 6).map((complaint) => (
              <div className="activity-item" key={complaint.id}>
                <span className={`activity-dot ${complaint.status === 'pending' ? 'warning' : 'info'}`} />
                <div>
                  <strong>{complaint.title}</strong>
                  <p>{complaint.studentName} - Room {complaint.roomNumber} - {complaint.status}</p>
                </div>
                <time>{complaint.updatedAt}</time>
              </div>
            ))}
          </div>
        </GlassPanel>
      ),
    },
    feedback: {
      title: "Feedback",
      subtitle: "Resident feedback for resolved complaints",
      content: (
        <GlassPanel title="Feedback" subtitle="Resident feedback for resolved complaints">
          {feedbackLoading ? (
            <div>Loading feedback...</div>
          ) : feedbackError ? (
            <div className="form-error">{feedbackError}</div>
          ) : (
            <DataTable
              columns={[
                { key: "studentName", label: "Student" },
                { key: "complaint", label: "Complaint" },
                { key: "rating", label: "Rating" },
                { key: "feedbackMessage", label: "Message" },
                { key: "status", label: "Status" },
              ]}
              rows={feedback}
            />
          )}
        </GlassPanel>
      ),
    },
    complaints: {
      title: "Complaints",
      subtitle: "Newest updates from hostel residents",
      content: (
        <GlassPanel title="Complaints" subtitle="Newest updates from hostel residents">
          <DataTable
            columns={complaintColumns}
            rows={data.recentComplaints}
            actions={(complaint) => (
              <select
                className="table-select"
                aria-label={`Update ${complaint.title} status`}
                value={complaint.status}
                onChange={(event) => handleComplaintStatusChange(complaint.id, event.target.value)}
              >
                <option value="pending">pending</option>
                <option value="in-progress">in-progress</option>
                <option value="resolved">resolved</option>
                <option value="rejected">rejected</option>
              </select>
            )}
          />
        </GlassPanel>
      ),
    },
    users: {
      title: "Users",
      subtitle: "Latest student and admin records",
      content: (
        <GlassPanel title="Users" subtitle="Latest student and admin records">
          <DataTable
            columns={userColumns}
            rows={data.recentUsers}
            actions={(user) => (
              <>
                <button className="table-action edit" type="button" onClick={() => handleUserStatusChange(user.id, 'active')}>
                  Activate
                </button>
                <button className="table-action delete" type="button" onClick={() => handleUserStatusChange(user.id, 'blocked')}>
                  Block
                </button>
                <button className="table-action" type="button" onClick={() => handleUserStatusChange(user.id, 'inactive')}>
                  Inactive
                </button>
              </>
            )}
          />
        </GlassPanel>
      ),
    },
  };

  const activeSection = sectionPages[section];
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (!getToken() || (storedUser?.role && storedUser.role.toLowerCase() !== 'admin')) {
    clearToken();
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <DashboardLayout
        role="Admin"
        title="Loading dashboard..."
        subtitle="Fetching the latest admin operations data."
        dashboardLinks={dashboardLinks}
        onLogout={handleLogout}
        sidebarProfile={adminProfile}
      >
        <div className="dashboard-loading">Loading admin dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        role="Admin"
        title="Dashboard error"
        subtitle="We could not load the admin dashboard right now."
        dashboardLinks={dashboardLinks}
        onLogout={handleLogout}
        sidebarProfile={adminProfile}
      >
        <div className="dashboard-error">{error}</div>
      </DashboardLayout>
    );
  }

  if (activeSection) {
    return (
      <DashboardLayout
        role="Admin"
        title={activeSection.title}
        subtitle={activeSection.subtitle}
        dashboardLinks={dashboardLinks}
        onLogout={handleLogout}
        adminProfile={adminProfile}
      >
        <Link className="dashboard-back-link" to="/admin-dashboard">
          Back to Overview
        </Link>
        <div className="dashboard-detail-page">{activeSection.content}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="Admin"
      title="Hostel operations command center"
      subtitle="Monitor complaints, residents, assignments, and resolution health with live backend data."
      dashboardLinks={dashboardLinks}
      onLogout={handleLogout}
      adminProfile={adminProfile}
    >
      <WelcomeBanner
        name="Admin Control Panel"
        message="Complaint volumes, staff workload, and recent user activity are ready for review."
        actionLabel="Generate Report"
        actionTo="/admin-dashboard/analytics"
      />

      <StatCards stats={stats} to="/admin-dashboard/analytics" />

      <div className="dashboard-two-column">
        <GlassPanel
          title="Complaint Analytics"
          subtitle="Status-wise operational load"
          to="/admin-dashboard/analytics"
        >
          <BarChart data={chartData} />
        </GlassPanel>
        <GlassPanel
          title="Quick Actions"
          subtitle="Administrative shortcuts"
          to="/admin-dashboard/messages"
        >
          <QuickActions actions={actions} />
        </GlassPanel>
      </div>

      <GlassPanel
        title="Recent Complaints"
        subtitle="Newest updates from hostel residents"
        to="/admin-dashboard/complaints"
      >
        <DataTable columns={complaintColumns} rows={data.recentComplaints} />
      </GlassPanel>

      <GlassPanel
        title="Recent Users"
        subtitle="Latest student and admin records"
        to="/admin-dashboard/users"
      >
        <DataTable columns={userColumns} rows={data.recentUsers} />
      </GlassPanel>
    </DashboardLayout>
  );
}

export default AdminDashboard;
