"use client";

import * as React from "react";
import type { AccountStatementParams } from "@/hooks/useAccountStatements";

export const StatementContext = React.createContext<{
  params: AccountStatementParams;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  page: number;
  setPage: (p: number) => void;
  perPage: number;
  setPerPage: (p: number) => void;
}>({
  params: {},
  searchQuery: "",
  setSearchQuery: () => {},
  activeFilter: "All",
  setActiveFilter: () => {},
  page: 1,
  setPage: () => {},
  perPage: 10,
  setPerPage: () => {},
});
