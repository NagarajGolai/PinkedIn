/* ============================================================
   PinkedIn — Auth logic
   Validation, password strength, success animation, mock submit
   No backend — everything is client-side (practice project)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[+]?[\d\s()-]{7,18}$/;

  function setError(field, msg) {
    field.classList.add("invalid");
    const err = field.querySelector(".field-error");
    if (err && msg) err.textContent = msg;
  }
  function clearError(field) {
    field.classList.remove("invalid");
  }

  function validateField(field) {
    const input = field.querySelector(".input, .textarea, .select");
    if (!input) return true;
    const val = input.value.trim();
    const required = field.hasAttribute("data-required") || input.required;

    if (required && !val) {
      setError(field, "This field is required.");
      return false;
    }
    if (!val) { clearError(field); return true; }

    const type = field.getAttribute("data-type") || input.type;
    if (type === "email" && !emailRe.test(val)) {
      setError(field, "Enter a valid email address.");
      return false;
    }
    if (type === "phone" && !phoneRe.test(val)) {
      setError(field, "Enter a valid phone number.");
      return false;
    }
    if (type === "password" && val.length < 8) {
      setError(field, "Password must be at least 8 characters.");
      return false;
    }
    if (type === "confirm") {
      const ref = $(field.getAttribute("data-match"));
      if (ref && ref.value !== val) {
        setError(field, "Passwords do not match.");
        return false;
      }
    }
    clearError(field);
    return true;
  }

  function wireValidation(form) {
    if (!form) return;
    const fields = $$(".field", form);
    fields.forEach((field) => {
      const input = field.querySelector(".input, .textarea, .select");
      if (input) input.addEventListener("blur", () => validateField(field));
      if (input) input.addEventListener("input", () => {
        if (field.classList.contains("invalid")) validateField(field);
      });
    });
  }

  function validateAll(form) {
    let ok = true;
    $$(".field", form).forEach((field) => {
      if (!validateField(field)) ok = false;
    });
    return ok;
  }

  /* ---------- Password strength ---------- */
  function scorePassword(pw) {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#dc2626", "#f59e0b", "#2563eb", "#16a34a"];

  function initPasswordStrength(input) {
    if (!input) return;
    const wrap = document.createElement("div");
    wrap.className = "pwd-strength";
    wrap.innerHTML = '<div class="pwd-bars"><span class="pwd-bar"></span><span class="pwd-bar"></span><span class="pwd-bar"></span><span class="pwd-bar"></span></div><span class="pwd-label">Enter a password</span>';
    input.closest(".field").appendChild(wrap);
    const bars = $$(".pwd-bar", wrap);
    const label = $(".pwd-label", wrap);

    input.addEventListener("input", () => {
      const score = scorePassword(input.value);
      bars.forEach((bar, i) => {
        bar.style.background = i < score ? strengthColors[score] : "var(--border)";
      });
      if (!input.value) label.textContent = "Enter a password";
      else label.textContent = strengthLabels[score] + " password";
      label.style.color = strengthColors[score] || "var(--text-muted)";
    });
  }

  /* ---------- Success overlay ---------- */
  function showSuccess(title, msg, redirectUrl) {
    let veil = document.querySelector(".success-veil");
    if (!veil) {
      veil = document.createElement("div");
      veil.className = "success-veil";
      document.body.appendChild(veil);
    }
    veil.innerHTML =
      '<div class="success-box">' +
      '<div class="success-check">✓</div>' +
      "<h3>" + title + "</h3>" +
      "<p>" + msg + "</p>" +
      '<button class="btn btn-primary btn-block" data-success-continue>Continue</button>' +
      "</div>";
    requestAnimationFrame(() => veil.classList.add("show"));
    veil.querySelector("[data-success-continue]").addEventListener("click", () => {
      veil.classList.remove("show");
      if (redirectUrl) window.location.href = redirectUrl;
    });
    if (redirectUrl) {
      setTimeout(() => {
        veil.classList.remove("show");
        window.location.href = redirectUrl;
      }, 1400);
    }
  }

  const API_BASE_URL = "http://localhost:8080";
  const USER_STORAGE_KEY = "pinkedin_user";
  const COMPANY_STORAGE_KEY = "pinkedin_company";

  async function postJson(path, payload) {
    const response = await fetch(API_BASE_URL + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.message || errorBody?.error || response.statusText || "Request failed";
      throw new Error(message);
    }
    return response.json();
  }

  /* ---------- Form wiring ---------- */
  function initForms() {
    // User register
    const userForm = $("#userRegisterForm");
    if (userForm) {
      wireValidation(userForm);
      initPasswordStrength($("#userPassword", userForm));
      const skillsInput = $("#userSkills", userForm);
      if (skillsInput) skillsInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
      userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateAll(userForm)) {
          window.PinkToast && window.PinkToast("Please fix the highlighted fields.", "error");
          return;
        }
        const payload = {
          name: $("#userFullName", userForm).value.trim(),
          email: $("#userEmail", userForm).value.trim(),
          password: $("#userPassword", userForm).value,
          phone: $("#userPhone", userForm).value.trim(),
          headline: $("#userHeadline", userForm).value.trim(),
          location: $("#userLocation", userForm).value.trim(),
          skills: $("#userSkills", userForm).value.trim(),
        };

        try {
          const data = await postJson("/user/register", payload);
          localStorage.removeItem(COMPANY_STORAGE_KEY);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
          showSuccess("Account created!", "Welcome to PinkedIn. Your job-seeker profile is ready.", "user-dashboard.html");
        } catch (error) {
          window.PinkToast && window.PinkToast(error.message, "error");
        }
      });
    }

    // Company register
    const coForm = $("#companyRegisterForm");
    if (coForm) {
      wireValidation(coForm);
      initPasswordStrength($("#companyPassword", coForm));
      coForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateAll(coForm)) {
          window.PinkToast && window.PinkToast("Please fix the highlighted fields.", "error");
          return;
        }
        const payload = {
          name: $("#companyName", coForm).value.trim(),
          description: $("#companyDesc", coForm).value.trim(),
          industry: $("#companyIndustry", coForm).value,
          website: $("#companyWebsite", coForm).value.trim(),
          companySize: $("#companySize", coForm).value,
          location: $("#companyLocation", coForm).value.trim(),
          ownerName: $("#ownerName", coForm).value.trim(),
          ownerEmail: $("#ownerEmail", coForm).value.trim(),
          ownerPassword: $("#companyPassword", coForm).value,
        };

        try {
          const data = await postJson("/company/register", payload);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(data));
          showSuccess("Company registered!", "Your recruiter workspace is ready to go.", "company-dashboard.html");
        } catch (error) {
          window.PinkToast && window.PinkToast(error.message, "error");
        }
      });
    }

    // User login
    const userLogin = $("#userLoginForm");
    if (userLogin) {
      wireValidation(userLogin);
      userLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateAll(userLogin)) return;
        const payload = {
          email: $("#loginEmail", userLogin).value.trim(),
          password: $("#loginPassword", userLogin).value,
        };
        try {
          const data = await postJson("/user/login", payload);
          localStorage.removeItem(COMPANY_STORAGE_KEY);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
          showSuccess("Welcome back!", "You're being signed in to your dashboard.", "user-dashboard.html");
        } catch (error) {
          window.PinkToast && window.PinkToast(error.message, "error");
        }
      });
    }

    // Company login
    const coLogin = $("#companyLoginForm");
    if (coLogin) {
      wireValidation(coLogin);
      coLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateAll(coLogin)) return;
        const payload = {
          email: $("#coLoginEmail", coLogin).value.trim(),
          password: $("#coLoginPassword", coLogin).value,
        };
        try {
          const data = await postJson("/company/login", payload);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(data));
          showSuccess("Welcome back!", "Signing you in to your recruiter workspace.", "company-dashboard.html");
        } catch (error) {
          window.PinkToast && window.PinkToast(error.message, "error");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initForms);

  // Expose
  window.PinkAuth = { showSuccess, validateAll, scorePassword };
})();
