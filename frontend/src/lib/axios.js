import axios from "axios";


export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api"),
  withCredentials: true,
});

// No Authorization header needed; rely on httpOnly cookie for JWT
