import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ra_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Detect Backend Unreachable
    if (!error.response || error.response.status >= 500) {
        // Trigger a custom event for the UI to catch
        window.dispatchEvent(new CustomEvent('backend-unreachable'));
    }

    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('ra_refresh_token');
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          // Note: Use axios directly to avoid interceptor loop if refresh fails
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('ra_access_token', accessToken);
          localStorage.setItem('ra_refresh_token', newRefreshToken);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
        }
      }

      // If no refresh token or refresh failed, logout
      console.error("Session expired.");
      localStorage.removeItem('ra_access_token');
      localStorage.removeItem('ra_refresh_token');
      localStorage.removeItem('ra_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
