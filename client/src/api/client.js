import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const publicAuthPath = ["/", "/login", "/register", "/verify-email"].includes(window.location.pathname);
    if (err.response?.status === 401 && !publicAuthPath) {
      window.location.assign("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
