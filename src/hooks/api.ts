import axios from "axios";
import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const getAuthToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 1 minute timeout
});

// Add auth token to requests
apiClient.interceptors.request.use(async config => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiClient };
