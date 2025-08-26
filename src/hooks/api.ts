import axios from "axios";
import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const STREAM_API_BASE_URL =
  import.meta.env.VITE_STREAM_API_BASE_URL ||
  import.meta.env.VITE_API_STREAM_URL ||
  "http://127.0.0.1:8080/grpc/messages";

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

const getUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting user id:", error);
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
export { API_BASE_URL, STREAM_API_BASE_URL, getAuthToken, getUserId };
