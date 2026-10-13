"use client";
import { PerformanceReportPage } from "@/components/hrm/performance-report-page";
import SalesDetails from "@/components/hrm/employee-sales-details";
export default function Page() { return <PerformanceReportPage mode="employee" renderLayout={props => <SalesDetails {...props} />} />; }
