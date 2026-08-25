const partials = {
  home: './partials/home.html',
  profile: './partials/profile.html',
  posts: './partials/posts.html',
  jobs: './partials/jobs.html',
  companies: './partials/companies.html',
  applications: './partials/applications.html',
  api: './partials/api.html'
};

async function loadViewPartials() {
  const sections = document.querySelectorAll('.view[data-partial]');
  await Promise.all(Array.from(sections).map(async (section) => {
    const viewId = section.dataset.partial;
    const url = partials[viewId];
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to load ${url}`);
      section.innerHTML = await response.text();
    } catch (error) {
      section.innerHTML = `<div class="panel-card"><p>${error.message}</p></div>`;
    }
  }));

  window.dispatchEvent(new CustomEvent('partials:ready'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadViewPartials);
} else {
  loadViewPartials();
}
