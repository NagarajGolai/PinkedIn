const responsePanel = document.getElementById('response-panel');
const apiResponse = document.getElementById('api-response');
const statusPill = document.getElementById('api-status');
const panelTitle = document.getElementById('panel-title');
const navButtons = Array.from(document.querySelectorAll('.nav-button'));
const panels = Array.from(document.querySelectorAll('.panel'));

const gatewayBase = '/';
const jsonHeaders = { 'Content-Type': 'application/json' };

const setResponse = (title, data) => {
  responsePanel.classList.remove('hidden');
  apiResponse.textContent = `${title}\n\n${JSON.stringify(data, null, 2)}`;
};

const handleError = async (error) => {
  const payload = error?.response ? await error.response.json().catch(() => null) : null;
  setResponse('Request Failed', payload || error.message || error);
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${gatewayBase}${path}`, options);
  const body = await response.text();
  let payload;
  try { payload = body ? JSON.parse(body) : null; } catch { payload = body; }
  if (!response.ok) {
    throw { response, payload };
  }
  return payload;
};

const updateStatus = async () => {
  try {
    await apiFetch('user/1');
    statusPill.textContent = 'Gateway: Connected';
    statusPill.style.background = 'linear-gradient(135deg, #22c55e, #0f766e)';
  } catch {
    statusPill.textContent = 'Gateway: Unreachable';
    statusPill.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
  }
};

const switchPanel = (targetId) => {
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.panel === targetId);
  });
  panels.forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== targetId && panel.id !== 'response-panel');
  });
  panelTitle.textContent = targetId.charAt(0).toUpperCase() + targetId.slice(1);
  if (targetId === 'dashboard') {
    setResponse('Welcome to PinkedIn', { info: 'Select a section from the sidebar to start.' });
  }
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => switchPanel(button.dataset.panel));
});

const registerForm = document.getElementById('register-form');
const profileForm = document.getElementById('profile-form');
const postForm = document.getElementById('post-form');
const jobForm = document.getElementById('job-form');
const companyForm = document.getElementById('company-form');
const applicationForm = document.getElementById('application-form');

const feedList = document.getElementById('feed-list');
const jobList = document.getElementById('job-list');
const companyList = document.getElementById('company-list');
const applicationList = document.getElementById('application-list');

const fetchProfile = async () => {
  const userId = profileForm.userId.value.trim();
  if (!userId) return;
  try {
    const response = await apiFetch(`user/${userId}`);
    setResponse('Profile Loaded', response);
  } catch (error) {
    handleError(error);
  }
};

const updateProfile = async () => {
  const userId = profileForm.userId.value.trim();
  if (!userId) return;
  const payload = {
    name: profileForm.name.value || undefined,
    phone: profileForm.phone.value || undefined,
    headline: profileForm.headline.value || undefined,
    location: profileForm.location.value || undefined,
    skills: profileForm.skills.value || undefined,
  };
  try {
    const response = await apiFetch(`user/${userId}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    setResponse('Profile Updated', response);
  } catch (error) {
    handleError(error);
  }
};

const deleteProfile = async () => {
  const userId = profileForm.userId.value.trim();
  if (!userId) return;
  try {
    await apiFetch(`user/${userId}`, { method: 'DELETE' });
    setResponse('Profile Deleted', { userId });
  } catch (error) {
    handleError(error);
  }
};

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: registerForm.name.value,
    email: registerForm.email.value,
    password: registerForm.password.value,
    phone: registerForm.phone.value,
    headline: registerForm.headline.value,
    location: registerForm.location.value,
    skills: registerForm.skills.value,
  };
  try {
    const response = await apiFetch('user/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    setResponse('User Registered', response);
  } catch (error) {
    handleError(error);
  }
});

profileForm.querySelector('#fetch-profile').addEventListener('click', fetchProfile);
profileForm.querySelector('#update-profile').addEventListener('click', updateProfile);
profileForm.querySelector('#delete-profile').addEventListener('click', deleteProfile);

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const userId = postForm.userId.value.trim();
  if (!userId) return;
  const payload = {
    content: postForm.content.value,
    postType: postForm.postType.value,
    mediaUrl: postForm.mediaUrl.value,
  };
  try {
    const response = await apiFetch('post', {
      method: 'POST',
      headers: { ...jsonHeaders, 'X-User-Id': userId },
      body: JSON.stringify(payload),
    });
    setResponse('Post Created', response);
  } catch (error) {
    handleError(error);
  }
});

document.getElementById('load-feed').addEventListener('click', async () => {
  try {
    const response = await apiFetch('post/feed');
    if (Array.isArray(response.content)) {
      feedList.innerHTML = response.content.map((post) => `
        <div class="list-item">
          <h4>Post #${post.id}</h4>
          <p>${post.content || 'No content provided.'}</p>
          <p><strong>Type:</strong> ${post.postType}</p>
          <p><strong>Author:</strong> ${post.userId}</p>
          <p><strong>Created:</strong> ${post.createdAt ?? 'N/A'}</p>
        </div>
      `).join('');
    } else {
      feedList.innerHTML = '<div class="list-item">No feed available.</div>';
    }
    setResponse('Feed Loaded', response);
  } catch (error) {
    handleError(error);
  }
});

jobForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    title: jobForm.title.value,
    description: jobForm.description.value,
    salary: jobForm.salary.value,
    experience: jobForm.experience.value,
    employmentType: jobForm.employmentType.value,
    skills: jobForm.skills.value,
    location: jobForm.location.value,
    deadline: jobForm.deadline.value || undefined,
    openings: Number(jobForm.openings.value),
    companyId: Number(jobForm.companyId.value),
  };
  try {
    const response = await apiFetch('job', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    setResponse('Job Created', response);
  } catch (error) {
    handleError(error);
  }
});

document.getElementById('load-jobs').addEventListener('click', async () => {
  try {
    const response = await apiFetch('job');
    if (Array.isArray(response.content)) {
      jobList.innerHTML = response.content.map((job) => `
        <div class="list-item">
          <h4>${job.title} (#${job.id})</h4>
          <p>${job.description || ''}</p>
          <p><strong>Company:</strong> ${job.companyId} · <strong>Status:</strong> ${job.status}</p>
          <p><strong>Deadline:</strong> ${job.deadline || 'None'} · <strong>Openings:</strong> ${job.openings}</p>
        </div>
      `).join('');
    } else {
      jobList.innerHTML = '<div class="list-item">No jobs available.</div>';
    }
    setResponse('Jobs Loaded', response);
  } catch (error) {
    handleError(error);
  }
});

companyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: companyForm.name.value,
    description: companyForm.description.value,
    industry: companyForm.industry.value,
    website: companyForm.website.value,
    companySize: companyForm.companySize.value,
    location: companyForm.location.value,
    ownerId: Number(companyForm.ownerId.value),
  };
  try {
    const response = await apiFetch('company', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    setResponse('Company Created', response);
  } catch (error) {
    handleError(error);
  }
});

document.getElementById('search-companies').addEventListener('click', async () => {
  const keyword = document.getElementById('company-search').value.trim();
  try {
    const response = await apiFetch(`company/search${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`);
    if (Array.isArray(response.content)) {
      companyList.innerHTML = response.content.map((company) => `
        <div class="list-item">
          <h4>${company.name} (#${company.id})</h4>
          <p>${company.description || ''}</p>
          <p><strong>Industry:</strong> ${company.industry || 'N/A'} · <strong>Location:</strong> ${company.location || 'N/A'}</p>
        </div>
      `).join('');
    } else {
      companyList.innerHTML = '<div class="list-item">No companies found.</div>';
    }
    setResponse('Companies Loaded', response);
  } catch (error) {
    handleError(error);
  }
});

applicationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    jobId: Number(applicationForm.jobId.value),
    resumeUrl: applicationForm.resumeUrl.value,
    coverLetter: applicationForm.coverLetter.value,
  };
  const userId = Number(applicationForm.userId.value);
  try {
    const response = await apiFetch('application', {
      method: 'POST',
      headers: { ...jsonHeaders, 'X-User-Id': userId },
      body: JSON.stringify(payload),
    });
    setResponse('Application Submitted', response);
  } catch (error) {
    handleError(error);
  }
});

document.getElementById('load-applications').addEventListener('click', async () => {
  const userId = document.getElementById('application-user-id').value.trim();
  if (!userId) return;
  try {
    const response = await apiFetch('application/me', {
      headers: { 'X-User-Id': userId },
    });
    if (Array.isArray(response.content)) {
      applicationList.innerHTML = response.content.map((application) => `
        <div class="list-item">
          <h4>Application #${application.id}</h4>
          <p><strong>Job ID:</strong> ${application.jobId}</p>
          <p><strong>Status:</strong> ${application.status}</p>
          <p>${application.coverLetter || ''}</p>
        </div>
      `).join('');
    } else {
      applicationList.innerHTML = '<div class="list-item">No applications found.</div>';
    }
    setResponse('Applications Loaded', response);
  } catch (error) {
    handleError(error);
  }
});

const init = () => {
  switchPanel('dashboard');
  updateStatus();
};

init();
