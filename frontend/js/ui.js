/* ============================================================
   PinkedIn — UI utilities (shared across all pages)
   Theme, reveal-on-scroll, ripples, toasts, navbar, dropdowns
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const THEME_KEY = "pinkedin-theme";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcons(theme);
  }
  function toggleTheme() {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }
  function updateThemeIcons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  // Apply saved theme ASAP (called on DOMContentLoaded)
  function initTheme() {
    applyTheme(getTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const targets = document.querySelectorAll(".reveal, [data-stagger]");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Button ripple ---------- */
  function initRipples() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ---------- Navbar (scroll + mobile toggle) ---------- */
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        links.classList.toggle("open");
      });
    }
    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1) {
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            if (links) links.classList.remove("open");
            if (toggle) toggle.classList.remove("open");
          }
        }
      });
    });
  }

  /* ---------- Scroll-to-top ---------- */
  function initScrollTop() {
    const btn = document.querySelector(".scroll-top");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Toasts ---------- */
  function ensureToastWrap() {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    return wrap;
  }
  function toast(message, type) {
    const wrap = ensureToastWrap();
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️";
    t.innerHTML = '<span class="toast-icon">' + icon + "</span><span>" + message + "</span>";
    wrap.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(20px)";
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }
  window.PinkToast = toast;

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      let display;
      if (target % 1 !== 0) display = val.toFixed(1);
      else if (target >= 1000) display = Math.floor(val).toLocaleString();
      else display = Math.floor(val);
      el.textContent = prefix + display + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---------- Generic dropdowns ---------- */
  function initDropdowns() {
    document.querySelectorAll("[data-dropdown]").forEach((trigger) => {
      const targetSel = trigger.getAttribute("data-dropdown");
      const target = document.querySelector(targetSel);
      if (!target) return;
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close others
        document.querySelectorAll(".dropdown.open").forEach((d) => {
          if (d !== target) d.classList.remove("open");
        });
        target.classList.toggle("open");
      });
    });
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown.open").forEach((d) => d.classList.remove("open"));
    });
    document.querySelectorAll(".dropdown").forEach((d) =>
      d.addEventListener("click", (e) => e.stopPropagation())
    );
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initReveal();
    initRipples();
    initNavbar();
    initScrollTop();
    initCounters();
    initDropdowns();
  });

  // Expose for other scripts
  window.PinkUI = { toast, toggleTheme, applyTheme, getTheme, animateCount };
})();
