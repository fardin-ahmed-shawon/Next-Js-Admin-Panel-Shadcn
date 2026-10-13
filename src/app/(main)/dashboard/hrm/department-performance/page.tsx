"use client";
import { PerformanceReportPage } from "@/components/hrm/performance-report-page";
import SalesDetails from "@/components/hrm/department-sales-details";
export default function Page() { return <PerformanceReportPage mode="department" renderLayout={props => <SalesDetails {...props} />} />; }
