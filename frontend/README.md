# PinkedIn

A modern enterprise **HR, recruitment, and professional networking** platform — built as a practice frontend for a Spring Boot backend.

> Connect. Hire. Grow.

PinkedIn combines the look and feel of **Zoho People**, **Zoho Recruit**, **LinkedIn**, and **Microsoft Fluent** into one premium SaaS experience.

---

## Tech stack

This is a **frontend-only** project. No frameworks, no build step for app logic, no backend, no database.

- **HTML5** — semantic markup
- **CSS3** — custom properties, grid, flexbox, glassmorphism, animations
- **Vanilla JavaScript (ES6)** — no jQuery, no React/Vue/Angular

[Vite](https://vitejs.dev) is used *only* as a local dev server and static build wrapper (`vite build` validates and emits the site to `dist/`). No application code is bundled or transformed.

---

## Folder structure

```
frontend/
├── index.html              # Landing page
├── login.html              # Login selection (User / Company)
├── register.html           # Registration selection (User / Company)
├── user-login.html         # User login form
├── company-login.html      # Company login form
├── user-register.html      # Job-seeker registration
├── company-register.html   # Company / recruiter registration
├── user-dashboard.html     # LinkedIn-style job-seeker dashboard
├── company-dashboard.html  # Recruiter dashboard
│
├── css/
│   ├── style.css           # Design system + components (tokens, buttons, cards, nav, footer)
│   ├── auth.css            # Marketing + auth pages (hero, forms, selection cards)
│   ├── dashboard.css       # Dashboard layout + modules (sidebar, feed, jobs, charts, tables)
│   └── responsive.css      # Breakpoints: 1200 / 1100 / 1024 / 900 / 768 / 560 / 420
│
├── js/
│   ├── ui.js               # Shared utilities: theme, scroll reveal, ripples, toasts, counters, dropdowns
│   ├── app.js              # Landing/marketing page interactions
│   ├── auth.js             # Form validation, password strength, success animation
│   └── dashboard.js        # Sidebar nav, section switching, feed, jobs, messages, charts, modals, tables
│
├── assets/
│   ├── images/logo.svg     # Brand mark
│   └── icons/              # (reserved)
│
└── README.md
```

---

## Design language

- **70% Zoho People** — clean enterprise SaaS, structured tables, KPI cards
- **20% LinkedIn** — professional feed, profile timeline, networking feel
- **10% Microsoft Fluent** — soft shadows, rounded corners, spacing

### Color system

| Token        | Value     | Use                |
|--------------|-----------|--------------------|
| Primary      | `#0A66C2` | Brand, actions     |
| Secondary    | `#2563EB` | Gradients          |
| Accent       | `#4F46E5` | Highlights         |
| Background   | `#F5F7FA` | Page bg            |
| Surface      | `#FFFFFF` | Cards              |
| Text         | `#1F2937` | Body               |
| Muted        | `#6B7280` | Secondary text     |
| Success      | `#16A34A` | Positive states    |
| Warning      | `#F59E0B` | Cautions           |
| Danger       | `#DC2626` | Destructive        |

Dark mode is supported via `[data-theme="dark"]` and a toggle in the navbar/top nav.

### Typography

- **Inter** (with Segoe UI / system-ui fallback)
- 3 weights: 400, 600, 700
- Line height 150% body / 120% headings

### Motion

Fade-in, slide-up, hover lift, card elevation, button ripple, sidebar collapse, smooth page transitions, loading skeletons, animated counters — all subtle, no flashy effects. Respects `prefers-reduced-motion`.

---

## Application flow

1. **Landing** (`index.html`) — hero, features, stats, testimonials, pricing, footer
2. **Register selection** (`register.html`) → User or Company
3. **User registration** (`user-register.html`) — validated form + password strength
4. **Company registration** (`company-register.html`)
5. **Login selection** (`login.html`) → User or Company
6. **User login** (`user-login.html`) / **Company login** (`company-login.html`)
7. **User dashboard** (`user-dashboard.html`) — LinkedIn-style: feed, jobs, companies, applications, messages, notifications, settings
8. **Company dashboard** (`company-dashboard.html`) — recruiter: jobs, applicants, analytics, announcements

All data is **dummy/static** — jobs, companies, posts, applicants, and analytics are defined in `js/dashboard.js`.

---

## Features

### User dashboard
- Collapsible dark sidebar with icons
- Top nav: search, notifications dropdown, messages dropdown, live date, theme toggle
- Hero banner with quick stats and quick actions
- Animated KPI cards (connections, applications, saved jobs, following)
- Profile: cover, avatar, timeline (experience/education), skills, resume, edit/delete
- LinkedIn-style feed: create post, like/comment/share, image placeholders
- Jobs: search, category filters, type filter, job cards, apply/save/view-details, details modal
- Companies: logo, industry, followers, open positions, follow button
- Applications: table with status badges + progress indicators
- Messages: conversation sidebar + chat panel with simulated replies
- Notifications: dropdown + dedicated page
- Settings: tabbed (theme, notifications, privacy, profile, language) with toggle switches

### Company dashboard
- Recruiter-focused sidebar
- Analytics KPI cards (jobs posted, open positions, applications, hiring rate)
- CSS-only bar charts and horizontal progress bars (no chart libraries)
- Circular progress (conic-gradient) for hiring goals
- Company profile with banner, stats, hiring funnel
- Job management: create/edit/delete via modal, searchable table, pagination, status badges
- Applicants table: match score, status, progress, approve/interview/reject actions
- Announcements: employer-branding posts with reach stats
- Analytics: time-to-hire, offer acceptance, cost per hire, funnel breakdown

---

## Accessibility

- Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`)
- Keyboard navigation with visible focus states
- ARIA labels on icon buttons and navigation
- Sufficient color contrast on text and status badges
- `prefers-reduced-motion` support

---

## Responsive

Tested breakpoints down to small phones. The sidebar becomes an off-canvas drawer on tablet/mobile, forms stack to a single column, tables scroll horizontally, and the message layout collapses to the chat panel only.

---

## Running locally

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # emits static site to /dist
npm run preview  # preview the production build
```

This frontend is designed to pair with a Spring Boot backend (not included here). All forms currently validate client-side and simulate success — wire them to your backend endpoints as needed.
