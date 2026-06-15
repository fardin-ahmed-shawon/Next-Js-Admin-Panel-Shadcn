"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthInitializer() {
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return null;
}
