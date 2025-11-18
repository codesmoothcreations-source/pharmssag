const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api"; // change for deployment

export const apiClient = {
  async get(url, token) {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json();
  },

  async post(url, body, token) {
    const isFormData = body instanceof FormData;
    
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: isFormData ? {
        ...(token && { Authorization: `Bearer ${token}` }),
      } : {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    return res.json();
  },

  async put(url, body, token) {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async del(url, token) {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json();
  },
};