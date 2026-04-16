import axios from "axios";

const DEFAULT_BASE_URL = "http://127.0.0.1:5000";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

