const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

export { API_BASE };

export async function apiFetch(path, { method = 'GET', body, token, headers = {} } = {}) {
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    init.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = data.message || res.statusText;
    throw new Error(message);
  }

  return data;
}

// Lightweight client with familiar get/post helpers
const getToken = () => {
  // Try auth context storage first
  const stored = localStorage.getItem('medimanager_auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token) return parsed.token;
    } catch (e) {
      // ignore parse errors and fall through
    }
  }
  // Fallback to legacy key if present
  return localStorage.getItem('token');
};

const buildUrl = (path, params) => {
  if (!params) return `${API_BASE}${path}`;
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

async function request(method, path, { params, data, headers } = {}) {
  const token = getToken();
  const url = buildUrl(path, params);
  return apiFetch(url, {
    method,
    body: data,
    token,
    headers,
  });
}

export const apiClient = {
  get: (path, options = {}) => request('GET', path, options),
  post: (path, data, options = {}) => request('POST', path, { ...options, data }),
  put: (path, data, options = {}) => request('PUT', path, { ...options, data }),
  delete: (path, options = {}) => request('DELETE', path, options),
};
