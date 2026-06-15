import Cookies from "js-cookie";

export const fetchClient = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get("auth_token");
  const headers = new Headers(options.headers);
  
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
};
