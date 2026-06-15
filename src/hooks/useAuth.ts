import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "./useUsers"; // assuming useUsers exports User

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: Cookies.get("auth_token") || null,
  isAuthenticated: !!Cookies.get("auth_token"),
  isLoading: true,

  setAuth: (token: string, user: User) => {
    Cookies.set("auth_token", token, { expires: 30, path: "/" }); // Expire in 30 days
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const { token } = get();
    if (token) {
      try {
        await fetch(`${API_URL}logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }
    
    Cookies.remove("auth_token", { path: "/" });
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    const { token } = get();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unauthenticated");
      }

      const result = await response.json();
      set({ user: result.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // If fetching the user fails, clear the token and state
      Cookies.remove("auth_token", { path: "/" });
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
