"use client";
import { PerformanceReportPage } from "@/components/hrm/performance-report-page";
import SalesDetails from "@/components/hrm/leaderboard-sales-details";
export default function Page() { return <PerformanceReportPage mode="leaderboard" renderLayout={props => <SalesDetails {...props} />} />; }
