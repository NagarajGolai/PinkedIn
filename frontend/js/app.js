/* ============================================================
   PinkedIn — Landing / marketing page interactions
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // Live date for any page that shows one
    const dateEl = document.querySelector("[data-live-date]");
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
    }

    // Trusted companies marquee pause on hover
    const marquee = document.querySelector(".trusted-logos");
    if (marquee) {
      // nothing fancy — hover handled via CSS
    }

    // Pricing toggle (monthly/annual) if present
    const priceToggle = document.querySelector("[data-price-toggle]");
    if (priceToggle) {
      priceToggle.addEventListener("change", () => {
        const annual = priceToggle.checked;
        document.querySelectorAll("[data-price-monthly]").forEach((el) => {
          const monthly = parseFloat(el.dataset.priceMonthly);
          const val = annual ? Math.round(monthly * 12 * 0.8) : monthly;
          el.textContent = annual ? val : val;
        });
        document.querySelectorAll("[data-price-period]").forEach((el) => {
          el.textContent = annual ? "/year" : "/month";
        });
      });
    }

    // Feature tab switch (if marketing page uses tabs)
    document.querySelectorAll("[data-feature-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const group = tab.closest("[data-feature-tabs]");
        if (!group) return;
        group.querySelectorAll("[data-feature-tab]").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-feature-tab");
        group.querySelectorAll("[data-feature-panel]").forEach((p) => {
          p.classList.toggle("active", p.getAttribute("data-feature-panel") === target);
        });
      });
    });
  });
})();
