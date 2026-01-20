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

  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = data.message || res.statusText;
    throw new Error(message);
  }

  return data;
}
