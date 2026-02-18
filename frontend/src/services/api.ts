import axios from 'axios';

// Resolve and normalize VITE_API_URL
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const normalizedBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

console.log('[API] Resolved Base URL:', normalizedBaseURL);

const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests and normalize URL
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ra_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Normalize request URL: remove leading slash if present to avoid Axios baseURL pitfall
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    // Log the constructed URL components for debugging (critical for mobile testing)
    console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.baseURL}/${config.url}`);

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
          const refreshUrl = `${normalizedBaseURL}/auth/refresh`;
          console.log(`[API] Refreshing token at: ${refreshUrl}`);

          const response = await axios.post(refreshUrl, {
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
