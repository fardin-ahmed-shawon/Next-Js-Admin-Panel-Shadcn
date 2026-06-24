import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";

export const fetchClient = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get("auth_token");
  const headers = new Headers(options.headers);
  
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Append user ID if logged in
  const user = useAuth.getState().user;
  if (user && user.id) {
    const userIdStr = user.id.toString();
    headers.set("X-User-Id", userIdStr);
    headers.set("user-id", userIdStr);
    headers.set("user_id", userIdStr);
  }

  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
};
