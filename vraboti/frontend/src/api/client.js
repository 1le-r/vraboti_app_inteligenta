import { translateServerMessage } from '../i18n/serverMessages';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

let apiLang = 'mk';
export const setApiLang = (l) => { apiLang = l; };
const TOKEN_KEY = 'vraboti_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

async function request(path, { method = 'GET', body, form, raw } = {}) {
  const headers = { 'Accept-Language': apiLang };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined)
  });

  if (res.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event('vraboti:logout'));
  }
  if (!res.ok) {
    let message = 'Нешто тргна наопаку. Обидете се повторно.';
    let code;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
      code = body.code;
    } catch {}
    const err = new Error(translateServerMessage(message, apiLang));
    err.status = res.status;
    err.code = code;
    throw err;
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

const qs = (params) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  verify: (email, code) => request('/auth/verify', { method: 'POST', body: { email, code } }),
  resendCode: (email) => request('/auth/resend', { method: 'POST', body: { email } }),
  me: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/me', { method: 'PUT', body: data }),

  jobs: (filters) => request('/jobs' + qs(filters)),
  job: (id) => request(`/jobs/${id}`),

  apply: (jobId, formData) => request(`/jobs/${jobId}/apply`, { method: 'POST', form: formData }),
  myApplications: () => request('/me/applications'),
  saved: () => request('/me/saved'),
  save: (jobId) => request(`/me/saved/${jobId}`, { method: 'POST' }),
  unsave: (jobId) => request(`/me/saved/${jobId}`, { method: 'DELETE' }),

  stats: () => request('/admin/stats'),
  adminJobs: () => request('/admin/jobs'),
  createJob: (data) => request('/admin/jobs', { method: 'POST', body: data }),
  updateJob: (id, data) => request(`/admin/jobs/${id}`, { method: 'PUT', body: data }),
  toggleJob: (id) => request(`/admin/jobs/${id}/toggle`, { method: 'PATCH' }),
  deleteJob: (id) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),
  adminApplications: (filters) => request('/admin/applications' + qs(filters)),
  openApplication: (id) => request(`/admin/applications/${id}`),
  setStatus: (id, status) => request(`/admin/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  downloadCv: async (id, fileName) => {
    const res = await request(`/admin/applications/${id}/cv`, { raw: true });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'cv';
    a.click();
    URL.revokeObjectURL(url);
  }
};
