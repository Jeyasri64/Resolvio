const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  let body = options.body;

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = (data && data.message) || res.statusText || 'Request failed';
    const error = new Error(err);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function post(path, body) {
  return request(path, { method: 'POST', body });
}

export async function put(path, body) {
  return request(path, { method: 'PUT', body });
}

export async function patch(path, body) {
  return request(path, { method: 'PATCH', body });
}

export async function del(path) {
  return request(path, { method: 'DELETE' });
}

export async function get(path) {
  return request(path, { method: 'GET' });
}

export { getToken, setToken, clearToken, API_BASE };
