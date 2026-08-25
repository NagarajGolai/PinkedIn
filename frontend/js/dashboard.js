/* ============================================================
   PinkedIn — Dashboard controller
   Works for both user-dashboard.html and company-dashboard.html
   Handles: sidebar, section switching, charts, feed, jobs,
   messages, notifications, settings, modals, tables
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));
  const toast = (m, t) => window.PinkToast && window.PinkToast(m, t);

  const API_BASE_URL = "http://localhost:8080";
  const USER_STORAGE_KEY = "pinkedin_user";
  const COMPANY_STORAGE_KEY = "pinkedin_company";
  const AppState = {
    feed: [],
    jobs: [],
    companies: [],
    applications: [],
    companyJobs: [],
    applicants: [],
    companyMap: {},
  };

  function parseJson(storageKey) {
    try {
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function getCurrentUser() {
    return parseJson(USER_STORAGE_KEY);
  }

  function getCurrentCompany() {
    return parseJson(COMPANY_STORAGE_KEY);
  }

  function getCurrentUserId() {
    return getCurrentUser()?.id || null;
  }

  function getCurrentCompanyId() {
    return getCurrentCompany()?.id || null;
  }

  function createInitials(text) {
    return (text || "")
      .toString()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PI";
  }

  function updateDashboardAuthState() {
    const user = getCurrentUser();
    const company = getCurrentCompany();
    const sideUser = document.querySelector(".side-user");
    if (sideUser) {
      const avatar = sideUser.querySelector(".avatar");
      const nameEl = sideUser.querySelector(".su-name");
      const roleEl = sideUser.querySelector(".su-role");
      if (company) {
        if (avatar) avatar.textContent = createInitials(company.name);
        if (nameEl) nameEl.textContent = company.name || "Recruiter";
        if (roleEl) roleEl.textContent = "Recruiter";
      } else if (user) {
        if (avatar) avatar.textContent = createInitials(user.name || "You");
        if (nameEl) nameEl.textContent = user.name || "Job Seeker";
        if (roleEl) roleEl.textContent = user.headline || "Job Seeker";
      }
    }

    const topAvatar = document.querySelector(".topnav-actions > .avatar.avatar-sm");
    if (topAvatar) {
      if (company) topAvatar.textContent = createInitials(company.name);
      else if (user) topAvatar.textContent = createInitials(user.name);
    }

    const createPostAvatar = document.querySelector("#createPostForm .avatar.avatar-md");
    if (createPostAvatar && user) createPostAvatar.textContent = createInitials(user.name);
  }

  function updateHeroSummary() {
    const heroTitle = document.querySelector(".hero-banner h2");
    const heroDesc = document.querySelector(".hero-banner p");
    const stats = document.querySelectorAll(".hero-quick-stats .hqs-num");
    const user = getCurrentUser();
    const company = getCurrentCompany();
    if (!heroTitle || !heroDesc) return;
    if (company) {
      heroTitle.textContent = `Good morning, ${company.name} 👋`;
      heroDesc.textContent = `Manage your openings, review applicants, and keep your hiring pipeline moving.`;
      if (stats[0]) stats[0].textContent = AppState.companyJobs.length ? String(AppState.companyJobs.length) : "0";
      if (stats[1]) stats[1].textContent = AppState.applicants.length ? String(AppState.applicants.length) : "0";
      if (stats[2]) stats[2].textContent = AppState.applications.length ? String(AppState.applications.length) : "0";
    } else if (user) {
      const firstName = user.name?.split(" ")[0] || "there";
      heroTitle.textContent = `Welcome back, ${firstName} 👋`;
      heroDesc.textContent = `Find new roles, track your applications, and keep building your professional network.`;
      if (stats[0]) stats[0].textContent = AppState.feed.length ? String(AppState.feed.length) : "0";
      if (stats[1]) stats[1].textContent = AppState.jobs.length ? String(AppState.jobs.length) : "0";
      if (stats[2]) stats[2].textContent = AppState.applications.length ? String(AppState.applications.length) : "0";
    }
  }

  function updateProfilePage() {
    const user = getCurrentUser();
    if (!user) return;
    const profileName = document.querySelector(".profile-head h2");
    const profileMeta = document.querySelector(".profile-head p");
    if (profileName) profileName.textContent = user.name || "Your Name";
    if (profileMeta) profileMeta.textContent = [user.headline || "Professional", user.location].filter(Boolean).join(" · ");
    const bio = document.querySelector(".profile-bio");
    if (bio) bio.textContent = user.headline
      ? `${user.headline} based in ${user.location || "your city"}. ${user.skills ? "Skilled in " + user.skills + "." : "Build your profile to attract recruiters."}`
      : bio.textContent;
    const skillsContainer = document.querySelector(".skill-tags");
    if (skillsContainer && user.skills) {
      skillsContainer.innerHTML = toTagList(user.skills).map((skill) => `<span class="skill-tag">${skill}</span>`).join("");
    }
    const profileInputs = document.querySelectorAll(".settings-panel[data-settings-panel='profile'] .input");
    profileInputs.forEach((input) => {
      const label = input.previousElementSibling?.textContent || "";
      if (label.includes("Full Name")) input.value = user.name || "";
      if (label.includes("Headline")) input.value = user.headline || "";
      if (label.includes("Email")) input.value = user.email || "";
    });
  }

  function initLiveDate() {
    const dateEl = document.querySelector("[data-live-date]");
    if (!dateEl) return;
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function redirectIfNotAuthenticated() {
    const isCompanyPage = !!document.querySelector("#companyJobsBody");
    const isUserPage = !!document.querySelector("#applicationsBody");
    if (isCompanyPage && !getCurrentCompany()) {
      window.location.href = "company-login.html";
    }
    if (isUserPage && !getCurrentUser()) {
      window.location.href = "user-login.html";
    }
  }

  function buildHeaders(extra = {}) {
    const headers = { "Content-Type": "application/json", ...extra };
    const userId = getCurrentUserId();
    if (userId) headers["X-User-Id"] = userId;
    return headers;
  }

  function parsePage(response) {
    return Array.isArray(response) ? response : response?.content || [];
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorBody = null;
      try { errorBody = await response.json(); } catch (_) {}
      const message = errorBody?.message || errorBody?.error || response.statusText || `HTTP ${response.status}`;
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function apiGet(path) {
    return fetchJson(API_BASE_URL + path, { method: "GET", headers: buildHeaders() });
  }

  async function apiPost(path, body) {
    return fetchJson(API_BASE_URL + path, { method: "POST", headers: buildHeaders(), body: JSON.stringify(body) });
  }

  async function apiPut(path, body) {
    return fetchJson(API_BASE_URL + path, { method: "PUT", headers: buildHeaders(), body: JSON.stringify(body) });
  }

  async function apiDelete(path) {
    return fetchJson(API_BASE_URL + path, { method: "DELETE", headers: buildHeaders() });
  }

  function formatPostedTime(dateString) {
    if (!dateString) return "just now";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const delta = Math.floor((Date.now() - date.getTime()) / 1000);
    if (delta < 60) return `${delta}s ago`;
    if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
    if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
    return `${Math.floor(delta / 86400)}d ago`;
  }

  async function loadFeed() {
    try {
      const page = await apiGet("/post/feed?size=12");
      AppState.feed = parsePage(page);
    } catch (error) {
      console.warn("Unable to load feed:", error.message);
      AppState.feed = [];
    }
  }

  async function loadJobs() {
    try {
      const page = await apiGet("/job?size=50");
      AppState.jobs = parsePage(page);
    } catch (error) {
      console.warn("Unable to load jobs:", error.message);
      AppState.jobs = [];
    }
    return AppState.jobs;
  }

  async function loadCompanies(keyword) {
    try {
      const path = keyword ? `/company/search?keyword=${encodeURIComponent(keyword)}&size=50` : "/company?size=50";
      const page = await apiGet(path);
      AppState.companies = parsePage(page);
      AppState.companyMap = AppState.companies.reduce((map, company) => {
        map[company.id] = company;
        return map;
      }, {});
    } catch (error) {
      console.warn("Unable to load companies:", error.message);
      AppState.companies = [];
      AppState.companyMap = {};
    }
    return AppState.companies;
  }

  async function loadApplications() {
    const userId = getCurrentUserId();
    if (!userId) {
      AppState.applications = [];
      return [];
    }
    try {
      const page = await apiGet("/application/me?size=50");
      AppState.applications = parsePage(page);
    } catch (error) {
      console.warn("Unable to load applications:", error.message);
      AppState.applications = [];
    }
    return AppState.applications;
  }

  async function loadCompanyJobs() {
    const companyId = getCurrentCompanyId();
    if (!companyId) {
      AppState.companyJobs = [];
      return [];
    }
    try {
      const page = await apiGet(`/job/company/${companyId}?size=50`);
      AppState.companyJobs = parsePage(page);
    } catch (error) {
      console.warn("Unable to load company jobs:", error.message);
      AppState.companyJobs = [];
    }
    return AppState.companyJobs;
  }

  async function loadApplicantsForJob(jobId) {
    if (!jobId) {
      AppState.applicants = [];
      return [];
    }
    try {
      const page = await apiGet(`/application/jobs/${jobId}?size=50`);
      AppState.applicants = parsePage(page);
    } catch (error) {
      console.warn("Unable to load job applicants:", error.message);
      AppState.applicants = [];
    }
    return AppState.applicants;
  }

  function getCompanyName(companyId) {
    return AppState.companyMap[companyId]?.name || `Company #${companyId}`;
  }

  async function loadDashboardData() {
    const companyPage = !!document.querySelector("#companyJobsBody");
    const userPage = !!document.querySelector("#applicationsBody");
    const feedPage = !!document.querySelector("#feedStream");

    const jobsPromise = loadJobs();
    const companiesPromise = loadCompanies();
    const feedPromise = feedPage ? loadFeed() : Promise.resolve([]);
    const applicationsPromise = userPage ? loadApplications() : Promise.resolve([]);
    const companyJobsPromise = companyPage ? loadCompanyJobs() : Promise.resolve([]);

    await Promise.all([jobsPromise, companiesPromise, feedPromise, applicationsPromise, companyJobsPromise]);
    mapJobs(AppState.jobs);
    mapCompanyJobs(AppState.companyJobs);

    if (companyPage && !AppState.companyJobs.length) {
      AppState.companyJobs = AppState.jobs.filter((job) => job.companyId === getCurrentCompanyId());
      mapCompanyJobs(AppState.companyJobs);
    }
  }

  function mapJobs(jobs) {
    AppState.jobs = jobs || [];
    AppState.jobMap = AppState.jobs.reduce((map, job) => {
      map[job.id] = job;
      return map;
    }, AppState.jobMap || {});
  }

  function mapCompanyJobs(jobs) {
    AppState.companyJobs = jobs || [];
    AppState.companyJobs.forEach((job) => {
      AppState.jobMap[job.id] = job;
    });
  }

  function getCompanyOpenings(company) {
    if (!company) return 0;
    return AppState.jobs.filter((job) => String(job.companyId) === String(company.id) && String(job.status).toLowerCase() === "open").length;
  }

  function toTagList(skills) {
    return skills ? skills.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : [];
  }

  function toJobType(job) {
    return job.employmentType || "Full-time";
  }

  function toSalary(job) {
    return job.salary || "Negotiable";
  }

  function buildSummary(job) {
    const parts = [];
    if (job.location) parts.push(job.location);
    if (job.experience) parts.push(job.experience);
    return parts.join(" · ") || "Remote";
  }

  /* ============================================================
     DUMMY DATA
     ============================================================ */
  const JOBS = [
    { id: 1, title: "Senior Frontend Engineer", company: "Nimbus Cloud", logo: "NC", logoBg: "#0a66c2", location: "Remote", type: "Full-time", exp: "5+ yrs", salary: "$140k–$180k", tags: ["React", "TypeScript", "AWS"], posted: "2d ago" },
    { id: 2, title: "Product Designer", company: "Lumen Labs", logo: "LL", logoBg: "#4f46e5", location: "Bengaluru", type: "Full-time", exp: "3+ yrs", salary: "$90k–$120k", tags: ["Figma", "UI/UX", "Research"], posted: "1d ago" },
    { id: 3, title: "Backend Developer", company: "Quanta Systems", logo: "QS", logoBg: "#16a34a", location: "Hyderabad", type: "Hybrid", exp: "4+ yrs", salary: "$110k–$150k", tags: ["Java", "Spring Boot", "PostgreSQL"], posted: "4h ago" },
    { id: 4, title: "DevOps Engineer", company: "Vertex Ops", logo: "VO", logoBg: "#f59e0b", location: "Remote", type: "Contract", exp: "6+ yrs", salary: "$130k–$170k", tags: ["Kubernetes", "Terraform", "CI/CD"], posted: "3d ago" },
    { id: 5, title: "Data Analyst", company: "Pulse Metrics", logo: "PM", logoBg: "#0ea5e9", location: "Mumbai", type: "Full-time", exp: "2+ yrs", salary: "$70k–$95k", tags: ["SQL", "Python", "Power BI"], posted: "5d ago" },
    { id: 6, title: "Mobile Engineer (iOS)", company: "AppVista", logo: "AV", logoBg: "#dc2626", location: "Remote", type: "Full-time", exp: "4+ yrs", salary: "$120k–$160k", tags: ["Swift", "SwiftUI"], posted: "6h ago" },
  ];

  const COMPANIES = [
    { name: "Nimbus Cloud", logo: "NC", bg: "#0a66c2", industry: "Cloud Services", location: "San Francisco", followers: "128k", openings: 14 },
    { name: "Lumen Labs", logo: "LL", bg: "#4f46e5", industry: "Product Design", location: "Bengaluru", followers: "86k", openings: 6 },
    { name: "Quanta Systems", logo: "QS", bg: "#16a34a", industry: "Enterprise Software", location: "Hyderabad", followers: "54k", openings: 22 },
    { name: "Vertex Ops", logo: "VO", bg: "#f59e0b", industry: "DevOps & Cloud", location: "Austin", followers: "41k", openings: 9 },
    { name: "Pulse Metrics", logo: "PM", bg: "#0ea5e9", industry: "Data & Analytics", location: "Mumbai", followers: "37k", openings: 5 },
    { name: "AppVista", logo: "AV", bg: "#dc2626", industry: "Mobile Apps", location: "Remote", followers: "62k", openings: 11 },
  ];

  const POSTS = [
    { author: "Aarav Mehta", initials: "AM", color: "#0a66c2", role: "Engineering Manager @ Nimbus Cloud", time: "2h", text: "We just shipped a 40% performance improvement to our real-time collaboration layer. Love what this team pulled off in two weeks. Hiring frontend engineers — DM me!", likes: 248, comments: 32, shares: 14, image: true },
    { author: "Sara Klein", initials: "SK", color: "#4f46e5", role: "Senior Product Designer @ Lumen Labs", time: "5h", text: "Reminder: good design is invisible. If your users notice the interface more than the outcome, you have work to do. Here are 3 anti-patterns I keep seeing in SaaS onboarding flows.", likes: 412, comments: 58, shares: 41, image: false },
    { author: "Daniel Park", initials: "DP", color: "#16a34a", role: "Talent Lead @ Quanta Systems", time: "1d", text: "We're expanding our backend team. If you breathe Spring Boot and love clean architecture, I want to talk. Remote-friendly, great comp, zero legacy cruft.", likes: 176, comments: 24, shares: 9, image: false },
  ];

  const APPLICATIONS = [
    { role: "Senior Frontend Engineer", company: "Nimbus Cloud", date: "Jul 18, 2026", status: "interview", progress: 3 },
    { role: "Product Designer", company: "Lumen Labs", date: "Jul 12, 2026", status: "shortlisted", progress: 2 },
    { role: "Backend Developer", company: "Quanta Systems", date: "Jul 05, 2026", status: "offer", progress: 4 },
    { role: "Data Analyst", company: "Pulse Metrics", date: "Jun 28, 2026", status: "rejected", progress: 4 },
    { role: "DevOps Engineer", company: "Vertex Ops", date: "Jun 20, 2026", status: "applied", progress: 1 },
  ];

  const APPLICANTS = [
    { name: "Priya Nair", role: "Senior Frontend Engineer", exp: "6 yrs", status: "shortlisted", applied: "2d ago", score: 92 },
    { name: "Marcus Lee", role: "Backend Developer", exp: "4 yrs", status: "interview", applied: "3d ago", score: 88 },
    { name: "Elena Costa", role: "Product Designer", exp: "5 yrs", status: "offer", applied: "1w ago", score: 95 },
    { name: "Tomás Rivera", role: "DevOps Engineer", exp: "7 yrs", status: "rejected", applied: "1w ago", score: 61 },
    { name: "Aisha Khan", role: "Data Analyst", exp: "3 yrs", status: "applied", applied: "2d ago", score: 79 },
  ];

  const COMPANY_JOBS = [
    { title: "Senior Frontend Engineer", dept: "Engineering", applicants: 42, status: "open", posted: "Jul 10" },
    { title: "Product Designer", dept: "Design", applicants: 28, status: "open", posted: "Jul 08" },
    { title: "Backend Developer", dept: "Engineering", applicants: 65, status: "open", posted: "Jul 02" },
    { title: "Marketing Lead", dept: "Marketing", applicants: 18, status: "paused", posted: "Jun 28" },
    { title: "QA Engineer", dept: "Engineering", applicants: 31, status: "closed", posted: "Jun 15" },
  ];

  const NOTIFICATIONS = [
    { text: "Nimbus Cloud viewed your application", time: "12m ago", unread: true },
    { text: "Aarav Mehta endorsed you for React", time: "1h ago", unread: true },
    { text: "Your application moved to Interview stage", time: "3h ago", unread: true },
    { text: "Lumen Labs posted a new role: Product Designer", time: "6h ago", unread: false },
    { text: "New connection request from Sara Klein", time: "1d ago", unread: false },
  ];

  const CONVERSATIONS = [
    { name: "Aarav Mehta", initials: "AM", color: "#0a66c2", prev: "Let's schedule the interview for Tuesday.", time: "12m", unread: true },
    { name: "Sara Klein", initials: "SK", color: "#4f46e5", prev: "Thanks for the referral!", time: "2h", unread: false },
    { name: "Daniel Park", initials: "DP", color: "#16a34a", prev: "Can you share your portfolio?", time: "1d", unread: false },
    { name: "Elena Costa", initials: "EC", color: "#0ea5e9", prev: "Congrats on the offer!", time: "2d", unread: false },
  ];

  const MESSAGES = {
    "Aarav Mehta": [
      { from: "them", text: "Hi! Thanks for applying to Nimbus Cloud.", time: "10:02 AM" },
      { from: "them", text: "Your profile looks strong. Are you open to a quick call?", time: "10:03 AM" },
      { from: "me", text: "Absolutely — Tuesday afternoon works for me.", time: "10:15 AM" },
      { from: "them", text: "Let's schedule the interview for Tuesday. 3pm your time?", time: "12m" },
    ],
    "Sara Klein": [
      { from: "me", text: "Hey Sara, I referred you for the design role at Lumen.", time: "9:00 AM" },
      { from: "them", text: "Thanks for the referral!", time: "9:30 AM" },
    ],
    "Daniel Park": [
      { from: "them", text: "Can you share your portfolio?", time: "Yesterday" },
    ],
    "Elena Costa": [
      { from: "them", text: "Congrats on the offer!", time: "2d ago" },
    ],
  };

  const ACTIVITY = [
    { ico: "📋", text: "New applicant for Senior Frontend Engineer", time: "8m ago" },
    { ico: "✅", text: "Interview scheduled with Priya Nair", time: "1h ago" },
    { ico: "📌", text: "Posted new job: Product Designer", time: "3h ago" },
    { ico: "👤", text: "Marcus Lee moved to Interview stage", time: "5h ago" },
    { ico: "🎉", text: "Elena Costa accepted the offer", time: "1d ago" },
  ];

  /* ============================================================
     SIDEBAR + SECTION SWITCHING
     ============================================================ */
  function signOut() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(COMPANY_STORAGE_KEY);
    if (window.location.pathname.endsWith("company-dashboard.html")) {
      window.location.href = "company-login.html";
    } else {
      window.location.href = "user-login.html";
    }
  }

  function initSidebar() {
    const dash = document.querySelector(".dash");
    if (!dash) return;

    // Collapse toggle (desktop)
    const collapseBtn = document.querySelector("[data-collapse]");
    if (collapseBtn) collapseBtn.addEventListener("click", () => dash.classList.toggle("collapsed"));

    // Mobile burger
    const burger = document.querySelector("[data-burger]");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (burger) {
      burger.addEventListener("click", () => {
        dash.classList.toggle("sidebar-open");
        backdrop && backdrop.classList.toggle("show");
      });
    }
    if (backdrop) backdrop.addEventListener("click", () => {
      dash.classList.remove("sidebar-open");
      backdrop.classList.remove("show");
    });

    // Logout
    const logoutBtn = document.querySelector("[data-logout]");
    if (logoutBtn) logoutBtn.addEventListener("click", signOut);

    // Section switching
    $$(".side-item[data-section]").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-section");
        switchSection(id);
        $$(".side-item").forEach((s) => s.classList.remove("active"));
        item.classList.add("active");
        // close mobile sidebar
        dash.classList.remove("sidebar-open");
        backdrop && backdrop.classList.remove("show");
        // scroll to top
        document.querySelector(".dash-main").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function switchSection(id) {
    $$(".dash-section").forEach((s) => s.classList.toggle("active", s.getAttribute("data-section") === id));
    // Lazy-trigger chart animations when analytics becomes visible
    if (id === "analytics") animateCharts();
    if (id === "dashboard") animateCharts();
  }

  /* ============================================================
     CHARTS (CSS-only)
     ============================================================ */
  function animateCharts() {
    $$("[data-chart-bars] .chart-bar").forEach((bar, i) => {
      const h = bar.dataset.h;
      bar.style.height = "0";
      setTimeout(() => { bar.style.height = h; }, 60 + i * 70);
    });
    $$("[data-hbar-fill]").forEach((fill, i) => {
      const w = fill.dataset.w;
      fill.style.width = "0";
      setTimeout(() => { fill.style.width = w; }, 80 + i * 90);
    });
    // Circle progress already set via CSS var; nudge re-render
    $$(".circle-prog").forEach((c) => {
      const pct = c.dataset.pct;
      c.style.setProperty("--pct", pct);
    });
  }

  /* ============================================================
     FEED
     ============================================================ */
  function renderFeed(container, list) {
    if (!container) return;
    list = list || AppState.feed;
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="es-ico">📰</div><h4>No recent posts</h4><p>Check back later for fresh updates from your network.</p></div>';
      return;
    }
    container.innerHTML = list.map(postHTML).join("");
    wireFeedActions(container);
  }

  function postHTML(p) {
    const author = p.author || getCurrentUser()?.name || "Someone";
    const initials = p.author ? p.author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "YO";
    const time = p.createdAt ? formatPostedTime(p.createdAt) : p.time || "just now";
    const imgBlock = p.mediaUrl ? '<div class="post-img">🖼️</div>' : "";
    return (
      '<article class="post card">' +
      '<div class="post-head">' +
      '<div class="avatar avatar-md" style="background:' + (p.color || "#0a66c2") + '">' + initials + "</div>" +
      '<div class="post-meta" style="flex:1">' +
      '<div class="name">' + author + "</div>" +
      '<div class="sub">' + (p.postType || "TEXT") + " · " + time + "</div>" +
      "</div></div>" +
      '<div class="post-body">' + (p.content || p.text || "") + "</div>" +
      imgBlock +
      '<div class="post-actions">' +
      '<button class="post-action" data-like>👍 Like</button>' +
      '<button class="post-action" data-comment>💬 Comment</button>' +
      '<button class="post-action" data-share>↗️ Share</button>' +
      "</div></article>"
    );
  }

  function wireFeedActions(scope) {
    $$("[data-like]", scope).forEach((btn) =>
      btn.addEventListener("click", () => {
        const liked = btn.classList.toggle("liked");
        btn.innerHTML = liked ? "👍 Liked" : "👍 Like";
        toast(liked ? "Post liked" : "Like removed");
      })
    );
    $$("[data-comment]", scope).forEach((btn) =>
      btn.addEventListener("click", () => toast("Comment composer coming soon"))
    );
    $$("[data-share]", scope).forEach((btn) =>
      btn.addEventListener("click", () => toast("Post shared to your network", "success"))
    );
  }

  async function initCreatePost() {
    const form = $("#createPostForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#postInput", form);
      const text = input.value.trim();
      if (!text) return;
      const userId = getCurrentUserId();
      if (!userId) {
        toast("Please sign in to post.", "error");
        return;
      }
      try {
        const payload = { content: text, postType: "TEXT" };
        const created = await apiPost("/post", payload);
        AppState.feed.unshift(created);
        const feed = $("#feedStream") || $("#feedStreamFeed");
        if (feed) {
          renderFeed(feed, AppState.feed);
        }
        input.value = "";
        toast("Post published", "success");
      } catch (error) {
        toast(error.message, "error");
      }
    });
  }

  /* ============================================================
     JOBS (render + filter)
     ============================================================ */
  function renderJobs(container, list) {
    if (!container) return;
    list = list || (AppState.jobs.length ? AppState.jobs : JOBS);
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="es-ico">🔍</div><h4>No jobs found</h4><p>Try adjusting your filters or search terms.</p></div>';
      return;
    }
    container.innerHTML = list.map(jobHTML).join("");
    $$("[data-apply]", container).forEach((b) =>
      b.addEventListener("click", async () => {
        const jobId = b.dataset.apply;
        const userId = getCurrentUserId();
        if (!userId) {
          toast("Please sign in to apply.", "error");
          return;
        }
        try {
          await apiPost("/application", { jobId: Number(jobId), resumeUrl: "", coverLetter: "" });
          toast("Application submitted for " + b.dataset.jobTitle, "success");
          await loadApplications();
          renderApplications($("#applicationsBody"));
        } catch (error) {
          toast(error.message, "error");
        }
      })
    );
    $$("[data-save]", container).forEach((b) =>
      b.addEventListener("click", () => {
        const saved = b.classList.toggle("saved");
        b.innerHTML = saved ? "★ Saved" : "☆ Save";
        toast(saved ? "Job saved" : "Job removed");
      })
    );
    $$("[data-view-job]", container).forEach((b) =>
      b.addEventListener("click", () => openJobModal(b.dataset.viewJob))
    );
  }

  function jobHTML(j) {
    const company = j.company || getCompanyName(j.companyId);
    const logoText = j.logo || createInitials(company);
    const logoColor = j.logoBg || "#0a66c2";
    const title = j.title || "Untitled role";
    const location = j.location || "Remote";
    const type = j.employmentType || j.type || "Full-time";
    const exp = j.experience || j.exp || "3+ yrs";
    const salary = j.salary || "Negotiable";
    const tags = j.tags || toTagList(j.skills || company);
    return (
      '<article class="job-card card card-hover">' +
      '<div class="job-card-top">' +
      '<div class="job-logo" style="background:' + logoColor + "20;color:" + logoColor + '">' + logoText + "</div>" +
      '<div><h4>' + title + '</h4><div class="job-company">' + company + "</div></div>" +
      "</div>" +
      '<div class="job-meta">' +
      "<span>📍 " + location + "</span><span>💼 " + type + "</span><span>⏳ " + exp + "</span><span>💰 " + salary + "</span>" +
      "</div>" +
      '<div class="job-tags">' + tags.map((t) => '<span class="chip">' + t + "</span>").join("") + "</div>" +
      '<div class="job-foot">' +
      '<button class="btn btn-primary btn-sm" data-apply="' + (j.id || title) + '" data-job-title="' + title + '">Apply</button>' +
      '<button class="btn btn-secondary btn-sm" data-save>☆ Save</button>' +
      '<button class="btn btn-ghost btn-sm" data-view-job="' + (j.id || title) + '">Details</button>' +
      "</div></article>"
    );
  }

  function openJobModal(id) {
    const j = AppState.jobs.find((x) => x.id == id) || JOBS.find((x) => x.id == id);
    if (!j) return;
    const company = j.company || getCompanyName(j.companyId);
    const logo = j.logo || createInitials(company);
    const bg = j.logoBg || "#0a66c2";
    const title = j.title || "Untitled role";
    const location = j.location || "Remote";
    const type = j.employmentType || j.type || "Full-time";
    const exp = j.experience || j.exp || "3+ yrs";
    const salary = j.salary || "Negotiable";
    const tags = j.tags || toTagList(j.skills || company);
    const body =
      '<div class="job-card-top" style="margin-bottom:16px"><div class="job-logo" style="background:' + bg + "20;color:" + bg + '">' + logo +
      '</div><div><h4>' + title + '</h4><div class="job-company">' + company + "</div></div></div>" +
      '<div class="job-meta" style="margin-bottom:16px"><span>📍 ' + location + "</span><span>💼 " + type + "</span><span>⏳ " + exp + "</span></div>" +
      '<p style="margin-bottom:16px">We are looking for a passionate ' + title + " to join our growing team. You'll work on high-impact projects with modern tooling and a collaborative culture.</p>" +
      '<div class="job-tags" style="margin-bottom:16px">' + tags.map((t) => '<span class="chip active">' + t + "</span>").join("") + "</div>" +
      '<div style="font-size:.85rem;color:var(--text-muted)">Salary: ' + salary + "</div>";
    openModal(title + " — " + company, body, [
      { label: "Close", cls: "btn-secondary", close: true },
      { label: "Apply Now", cls: "btn-primary", action: () => toast("Application submitted!", "success") },
    ]);
  }

  function initJobFilters() {
    const search = $("#jobSearch");
    const filterBtns = $$("[data-job-filter]");
    const typeSel = $("#jobType");
    const grid = $("#jobGrid");
    if (!grid) return;
    let activeCat = "all";

    function getJobList() {
      return AppState.jobs.length ? AppState.jobs : JOBS;
    }

    function applyFilters() {
      const q = (search && search.value.toLowerCase()) || "";
      const type = (typeSel && typeSel.value) || "";
      const filtered = getJobList().filter((j) => {
        const title = (j.title || "").toString().toLowerCase();
        const company = (j.company || getCompanyName(j.companyId) || "").toString().toLowerCase();
        const tags = (j.tags || toTagList(j.skills || company)).join(" ").toLowerCase();
        const matchesQ = !q || title.includes(q) || company.includes(q) || tags.includes(q);
        const matchesCat = activeCat === "all" || tags.includes(activeCat);
        const matchesType = !type || (j.employmentType || j.type || "Full-time") === type;
        return matchesQ && matchesCat && matchesType;
      });
      renderJobs(grid, filtered);
    }

    if (search) search.addEventListener("input", applyFilters);
    if (typeSel) typeSel.addEventListener("change", applyFilters);
    filterBtns.forEach((b) =>
      b.addEventListener("click", () => {
        filterBtns.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        activeCat = b.dataset.jobFilter;
        applyFilters();
      })
    );
  }

  /* ============================================================
     COMPANIES
     ============================================================ */
  function renderCompanies(container, list) {
    if (!container) return;
    list = list || AppState.companies;
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="es-ico">🏢</div><h4>No companies found</h4><p>Try again in a moment or check back later.</p></div>';
      return;
    }
    container.innerHTML = list.map(coHTML).join("");
    $$("[data-follow]", container).forEach((b) =>
      b.addEventListener("click", () => {
        const on = b.classList.toggle("active");
        b.innerHTML = on ? "✓ Following" : "+ Follow";
        toast(on ? "Now following " + b.dataset.follow : "Unfollowed " + b.dataset.follow);
      })
    );
  }
  function coHTML(c) {
    const name = c.name || "Company";
    const logo = c.logo || createInitials(name);
    const bg = c.bg || "#0a66c2";
    const industry = c.industry || c.description || "Hiring now";
    const location = c.location || "Remote";
    const followers = c.followers || "12k";
    const openings = c.openings || (c.id ? getCompanyOpenings(c) : "0");
    return (
      '<article class="company-card card card-hover">' +
      '<div class="company-logo-lg" style="background:' + bg + '">' + logo + "</div>" +
      "<h4>" + name + '</h4><div class="industry">' + industry + "</div>" +
      '<div style="font-size:.8rem;color:var(--text-muted);margin-bottom:12px">📍 ' + location + "</div>" +
      '<div class="company-stats-row">' +
      '<div><div class="cs-num">' + followers + '</div><div class="cs-label">Followers</div></div>' +
      '<div><div class="cs-num">' + openings + '</div><div class="cs-label">Open Jobs</div></div>' +
      "</div>" +
      '<button class="btn btn-secondary btn-block" data-follow="' + name + '">+ Follow</button>' +
      "</article>"
    );
  }

  /* ============================================================
     APPLICATIONS TABLE
     ============================================================ */
  function renderApplications(container) {
    if (!container) return;
    const rows = (AppState.applications.length ? AppState.applications : APPLICATIONS).map((a) => {
      const job = AppState.jobMap?.[a.jobId] || {};
      const company = job.companyId ? getCompanyName(job.companyId) : a.company || "Company";
      const title = a.role || job.title || `Job #${a.jobId || "?"}`;
      const date = a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : a.date || "—";
      const status = a.status || "applied";
      const steps = 4;
      const progressCount = status === "offer" ? 4 : status === "interview" ? 3 : status === "shortlisted" ? 2 : 1;
      const prog = Array.from({ length: steps }, (_, i) =>
        '<span class="progress-step ' + (i < progressCount ? "done" : "") + '"></span>'
      ).join("");
      return (
        "<tr><td class='cell-strong'>" + title + "</td><td>" + company + "</td><td>" + date + "</td>" +
        '<td><span class="status-badge sb-' + status + '"><span class="dot"></span>' + cap(status) + "</span></td>" +
        '<td><div class="progress-steps">' + prog + "</div></td>" +
        '<td><button class="btn btn-ghost btn-sm">View</button></td></tr>'
      );
    });
    container.innerHTML = rows.join("");
  }

  /* ============================================================
     COMPANY: JOBS TABLE + APPLICANTS
     ============================================================ */
  function renderCompanyJobs(container) {
    if (!container) return;
    const jobs = AppState.companyJobs.length ? AppState.companyJobs : COMPANY_JOBS;
    container.innerHTML = jobs.map((j, i) => {
      const title = j.title || "Untitled role";
      const dept = j.dept || j.department || "Team";
      const applicants = j.applicants || j.applicationCount || "0";
      const status = j.status || "open";
      const posted = j.posted || "—";
      return (
        "<tr><td class='cell-strong'>" + title + "</td><td>" + dept + "</td><td>" + applicants + "</td>" +
        '<td><span class="status-badge sb-' + (status === "open" ? "shortlisted" : status === "paused" ? "interview" : "rejected") + '"><span class="dot"></span>' + cap(status) + "</span></td>" +
        "<td>" + posted + "</td>" +
        '<td><button class="btn btn-ghost btn-sm" data-edit-job="' + i + '">Edit</button> <button class="btn btn-ghost btn-sm" data-del-job="' + i + '" style="color:var(--danger)">Delete</button></td></tr>'
      );
    }).join("");
    $$("[data-edit-job]", container).forEach((b) =>
      b.addEventListener("click", () => openJobEditor(jobs[+b.dataset.editJob]))
    );
    $$("[data-del-job]", container).forEach((b) =>
      b.addEventListener("click", () => toast("Job deleted (demo)", "error"))
    );
  }

  function renderApplicants(container) {
    if (!container) return;
    const applicants = AppState.applicants.length ? AppState.applicants : APPLICANTS;
    container.innerHTML = applicants.map((a, i) => {
      const name = a.name || `Applicant #${i + 1}`;
      const role = a.role || a.position || "Candidate";
      const exp = a.exp || a.experience || "—";
      const score = a.score || a.rating || "—";
      const status = a.status || "applied";
      const steps = 4;
      const progressCount = status === "offer" ? 4 : status === "interview" ? 3 : status === "shortlisted" ? 2 : status === "applied" ? 1 : 1;
      return (
        "<tr><td><div style='display:flex;align-items:center;gap:10px'><span class='avatar avatar-sm'>" + initials(name) + "</span><span class='cell-strong'>" + name + "</span></div></td>" +
        "<td>" + role + "</td><td>" + exp + "</td><td>" + score + "%</td>" +
        '<td><span class="status-badge sb-' + status + '"><span class="dot"></span>' + cap(status) + "</span></td>" +
        '<td><div class="progress-steps">' + Array.from({ length: steps }, (_, k) => '<span class="progress-step ' + (k < progressCount ? "done" : "") + '"></span>').join("") + "</div></td>" +
        '<td><button class="btn btn-primary btn-sm" data-approve="' + i + '">Approve</button> <button class="btn btn-ghost btn-sm" data-interview="' + i + '">Interview</button> <button class="btn btn-ghost btn-sm" data-reject="' + i + '" style="color:var(--danger)">Reject</button></td></tr>'
      );
    }).join("");
    $$("[data-approve]", container).forEach((b) => b.addEventListener("click", () => toast(applicants[+b.dataset.approve].name + " shortlisted", "success")));
    $$("[data-interview]", container).forEach((b) => b.addEventListener("click", () => toast("Interview scheduled with " + applicants[+b.dataset.interview].name, "success")));
    $$("[data-reject]", container).forEach((b) => b.addEventListener("click", () => toast(applicants[+b.dataset.reject].name + " rejected", "error")));
  }

  function openJobEditor(job) {
    const body =
      '<div class="field" data-type="text" data-required><label class="field-label">Job Title<span class="req">*</span></label><input class="input" value="' + (job ? job.title : "") + '"></div>' +
      '<div class="form-grid-2">' +
      '<div class="field"><label class="field-label">Department</label><input class="input" value="' + (job ? job.dept : "") + '"></div>' +
      '<div class="field"><label class="field-label">Location</label><input class="input" value="Remote"></div></div>' +
      '<div class="form-grid-2">' +
      '<div class="field"><label class="field-label">Experience</label><input class="input" value="5+ yrs"></div>' +
      '<div class="field"><label class="field-label">Salary Range</label><input class="input" value="$120k–$160k"></div></div>' +
      '<div class="field"><label class="field-label">Description</label><textarea class="textarea">We are looking for…</textarea></div>' +
      '<div class="field"><label class="field-label">Status</label><select class="select"><option>Open</option><option>Paused</option><option>Closed</option></select></div>';
    openModal(job ? "Edit Job" : "Create Job", body, [
      { label: "Cancel", cls: "btn-secondary", close: true },
      { label: "Save Job", cls: "btn-primary", action: () => { closeModal(); toast("Job saved", "success"); } },
    ]);
  }

  /* ============================================================
     ANNOUNCEMENTS
     ============================================================ */
  function renderAnnouncements(container) {
    if (!container) return;
    container.innerHTML = POSTS.slice(0, 2).map((p) =>
      '<article class="announce-card card">' +
      '<div class="ac-head"><div class="avatar avatar-md" style="background:' + p.color + '">' + p.initials + "</div>" +
      '<div><div class="name" style="font-weight:700">' + p.author + '</div><div style="font-size:.78rem;color:var(--text-muted)">' + p.time + " ago</div></div></div>" +
      '<div class="ac-body">' + p.text + "</div>" +
      '<div class="post-actions"><button class="post-action" data-like>👍 Like</button><button class="post-action">💬 Comment</button></div>' +
      "</article>"
    ).join("");
  }

  function initCreateAnnouncement() {
    const form = $("#createAnnouncementForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#announcementInput", form);
      if (!input.value.trim()) return;
      const box = $("#announcementsFeed");
      box.insertAdjacentHTML(
        "afterbegin",
        '<article class="announce-card card"><div class="ac-head"><div class="avatar avatar-md" style="background:#0a66c2">YO</div><div><div style="font-weight:700">Your Company</div><div style="font-size:.78rem;color:var(--text-muted)">just now</div></div></div><div class="ac-body">' + input.value + "</div></article>"
      );
      input.value = "";
      toast("Announcement posted", "success");
    });
  }

  /* ============================================================
     MESSAGES
     ============================================================ */
  function initMessages() {
    const list = $("#convList");
    const stream = $("#msgStream");
    const head = $("#msgHead");
    const input = $("#msgInput");
    const sendBtn = $("#msgSend");
    if (!list || !stream) return;

    list.innerHTML = CONVERSATIONS.map((c, i) =>
      '<div class="conv' + (i === 0 ? " active" : "") + '" data-conv="' + c.name + '">' +
      '<div class="avatar avatar-sm" style="background:' + c.color + '">' + c.initials + "</div>" +
      '<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between"><span class="conv-name">' + c.name + '</span><span class="conv-time">' + c.time + "</span></div>" +
      '<div class="conv-prev">' + c.prev + "</div></div>" +
      (c.unread ? '<span class="conv-dot"></span>' : "") +
      "</div>"
    ).join("");

    function openConv(name) {
      $$(".conv", list).forEach((el) => el.classList.toggle("active", el.dataset.conv === name));
      head.innerHTML = '<div class="avatar avatar-sm" style="background:' + (CONVERSATIONS.find((c) => c.name === name) || {}).color + '">' + (CONVERSATIONS.find((c) => c.name === name) || {}).initials + "</div><div><div style='font-weight:700'>" + name + "</div><div style='font-size:.78rem;color:var(--text-muted)'>Active now</div></div>";
      const msgs = MESSAGES[name] || [];
      stream.innerHTML = msgs.map((m) =>
        '<div class="msg-bubble ' + m.from + '">' + m.text + '<div class="msg-time">' + m.time + "</div></div>"
      ).join("");
      stream.scrollTop = stream.scrollHeight;
    }

    $$(".conv", list).forEach((el) => el.addEventListener("click", () => openConv(el.dataset.conv)));
    openConv(CONVERSATIONS[0].name);

    function send() {
      const text = input.value.trim();
      if (!text) return;
      stream.insertAdjacentHTML("beforeend", '<div class="msg-bubble me">' + text + '<div class="msg-time">now</div></div>');
      stream.scrollTop = stream.scrollHeight;
      input.value = "";
      // simulated reply
      setTimeout(() => {
        stream.insertAdjacentHTML("beforeend", '<div class="msg-bubble them">Thanks for the message! 👍<div class="msg-time">now</div></div>');
        stream.scrollTop = stream.scrollHeight;
      }, 900);
    }
    if (sendBtn) sendBtn.addEventListener("click", send);
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  }

  /* ============================================================
     NOTIFICATIONS DROPDOWN CONTENT
     ============================================================ */
  function renderNotifications() {
    const dd = $("#notificationsDropdown");
    if (!dd) return;
    const body = $(".dropdown-body", dd) || dd;
    body.innerHTML = NOTIFICATIONS.map((n) =>
      '<div class="dropdown-item' + (n.unread ? " unread" : "") + '"><div class="avatar avatar-sm">🔔</div><div><div class="di-text">' + n.text + '</div><div class="di-time">' + n.time + "</div></div></div>"
    ).join("");
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  function initSettings() {
    $$(".settings-tab").forEach((tab) =>
      tab.addEventListener("click", () => {
        $$(".settings-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.settingsTab;
        $$(".settings-panel").forEach((p) => p.classList.toggle("active", p.dataset.settingsPanel === target));
      })
    );
    $$(".switch").forEach((sw) => sw.addEventListener("click", () => sw.classList.toggle("on")));
  }

  /* ============================================================
     ACTIVITY FEED
     ============================================================ */
  function renderActivity(container) {
    if (!container) return;
    container.innerHTML = ACTIVITY.map((a) =>
      '<div class="activity-item"><div class="activity-ico">' + a.ico + '</div><div><div class="ai-text">' + a.text + '</div><div class="ai-time">' + a.time + "</div></div></div>"
    ).join("");
  }

  /* ============================================================
     MODAL
     ============================================================ */
  function openModal(title, bodyHTML, buttons) {
    let veil = document.querySelector(".modal-veil");
    if (!veil) {
      veil = document.createElement("div");
      veil.className = "modal-veil";
      document.body.appendChild(veil);
    }
    const footHTML = (buttons || [])
      .map((b, i) => '<button class="btn ' + b.cls + '" data-modal-btn="' + i + '">' + b.label + "</button>")
      .join("");
    veil.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h3>' + title + '</h3><button class="modal-close" aria-label="Close">×</button></div>' +
      '<div class="modal-body">' + bodyHTML + "</div>" +
      '<div class="modal-foot">' + footHTML + "</div></div>";
    requestAnimationFrame(() => veil.classList.add("open"));
    const close = () => closeModal();
    veil.querySelector(".modal-close").addEventListener("click", close);
    veil.addEventListener("click", (e) => { if (e.target === veil) close(); });
    (buttons || []).forEach((b, i) => {
      const btn = veil.querySelector('[data-modal-btn="' + i + '"]');
      if (!btn) return;
      btn.addEventListener("click", () => {
        if (b.close) close();
        else if (b.action) b.action();
      });
    });
  }
  function closeModal() {
    const veil = document.querySelector(".modal-veil");
    if (veil) veil.classList.remove("open");
  }

  /* ============================================================
     DELETE PROFILE CONFIRM
     ============================================================ */
  function initProfileActions() {
    const del = $("[data-delete-profile]");
    if (del) del.addEventListener("click", () =>
      openModal("Delete Profile?", "<p>This will permanently remove your profile, connections, and applications. This action cannot be undone.</p>", [
        { label: "Cancel", cls: "btn-secondary", close: true },
        { label: "Delete", cls: "btn-danger", action: () => { closeModal(); toast("Profile deleted (demo)", "error"); setTimeout(() => (window.location.href = "index.html"), 1200); } },
      ])
    );
    const edit = $("[data-edit-profile]");
    if (edit) edit.addEventListener("click", () =>
      openModal("Edit Profile", '<div class="field"><label class="field-label">Full Name</label><input class="input" value="Alex Johnson"></div><div class="field"><label class="field-label">Headline</label><input class="input" value="Senior Software Engineer"></div><div class="field"><label class="field-label">Location</label><input class="input" value="Bengaluru, India"></div><div class="field"><label class="field-label">Bio</label><textarea class="textarea">Passionate builder of web apps.</textarea></div>', [
        { label: "Cancel", cls: "btn-secondary", close: true },
        { label: "Save", cls: "btn-primary", action: () => { closeModal(); toast("Profile updated", "success"); } },
      ])
    );
  }

  /* ============================================================
     COMPANY: Create Job button
     ============================================================ */
  function initCompanyActions() {
    const createJob = $("[data-create-job]");
    if (createJob) createJob.addEventListener("click", () => openJobEditor(null));
    const editCompany = $("[data-edit-company]");
    if (editCompany) editCompany.addEventListener("click", () =>
      openModal("Edit Company Profile", '<div class="field"><label class="field-label">Company Name</label><input class="input" value="Nimbus Cloud"></div><div class="field"><label class="field-label">Industry</label><input class="input" value="Cloud Services"></div><div class="field"><label class="field-label">Website</label><input class="input" value="https://nimbus.cloud"></div><div class="field"><label class="field-label">Description</label><textarea class="textarea">Enterprise cloud platform.</textarea></div>', [
        { label: "Cancel", cls: "btn-secondary", close: true },
        { label: "Save", cls: "btn-primary", action: () => { closeModal(); toast("Company profile updated", "success"); } },
      ])
    );
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function initials(name) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(); }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener("DOMContentLoaded", async () => {
    redirectIfNotAuthenticated();
    initSidebar();
    initLiveDate();
    await loadDashboardData();
    updateDashboardAuthState();
    updateProfilePage();
    updateHeroSummary();
    renderFeed($("#feedStream"));
    renderFeed($("#feedStreamFeed"));
    initCreatePost();
    renderJobs($("#jobGrid"));
    initJobFilters();
    renderCompanies($("#companyGrid"));
    renderApplications($("#applicationsBody"));
    renderCompanyJobs($("#companyJobsBody"));
    renderApplicants($("#applicantsBody"));
    renderAnnouncements($("#announcementsFeed"));
    initCreateAnnouncement();
    initMessages();
    renderNotifications();
    initSettings();
    renderActivity($("#activityFeed"));
    initProfileActions();
    initCompanyActions();
    animateCharts();
  });
})();
