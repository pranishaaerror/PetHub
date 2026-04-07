import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ||'http://localhost:5000/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = config.headers.Authorization ?? `Bearer ${token}`;
  }

  return config;
});
