const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const loginUser = async (userData) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateProfile = async (profileData) => {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createSession = async (sessionData) => {
  const res = await fetch(`${API_URL}/session/create`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(sessionData)
  });
  return res.json();
};

export const submitSpeech = async (speechFormData) => {
  const res = await fetch(`${API_URL}/submit/speech`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: speechFormData
  });
  return res.json();
};

export const submitCognitive = async (cognitiveData) => {
  const res = await fetch(`${API_URL}/submit/cognitive`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(cognitiveData)
  });
  return res.json();
};

export const getPrediction = async (sessionId) => {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ session_id: sessionId })
  });
  return res.json();
};

export const getUserHistory = async (userId) => {
  const res = await fetch(`${API_URL}/users/${userId}/history`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyOtp = async (email, otp) => {
  const res = await fetch(`${API_URL}/users/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const resetPassword = async (email, otp, new_password) => {
  const res = await fetch(`${API_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, new_password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
