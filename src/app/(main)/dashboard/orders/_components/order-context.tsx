"use client";

import * as React from "react";
export type TimeRange = "daily" | "yesterday" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

export const OrderContext = React.createContext<{
  params: any;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  paymentFilter: string;
  setPaymentFilter: (s: string) => void;
  courierFilter: string;
  setCourierFilter: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  perPage: number;
  setPerPage: (p: number) => void;
  timeRange: TimeRange;
  setTimeRange: (t: TimeRange) => void;
  customFrom: string;
  setCustomFrom: (s: string) => void;
  customTo: string;
  setCustomTo: (s: string) => void;
  pagination: any;
  summary: any;
}>({
  params: {},
  searchQuery: "",
  setSearchQuery: () => { },
  statusFilter: "All",
  setStatusFilter: () => { },
  paymentFilter: "All",
  setPaymentFilter: () => { },
  courierFilter: "All",
  setCourierFilter: () => { },
  page: 1,
  setPage: () => { },
  perPage: 100,
  setPerPage: () => { },
  timeRange: "daily",
  setTimeRange: () => { },
  customFrom: "",
  setCustomFrom: () => { },
  customTo: "",
  setCustomTo: () => { },
  pagination: {},
  summary: {},
});
