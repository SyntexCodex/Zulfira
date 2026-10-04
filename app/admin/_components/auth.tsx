"use client";

import { createContext, useContext } from "react";
import type { Session } from "./types";

interface AuthValue {
  session: Session | null;
  logout: () => Promise<void>;
}

export const AuthCtx = createContext<AuthValue>({
  session: null,
  logout: async () => {},
});

export function useAuth(): AuthValue {
  return useContext(AuthCtx);
}
