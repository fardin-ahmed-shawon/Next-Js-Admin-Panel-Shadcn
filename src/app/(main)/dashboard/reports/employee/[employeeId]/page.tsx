"use client";
import { PerformanceReportPage } from "@/components/hrm/performance-report-page";
import SalesDetails from "@/components/hrm/employee-detail-sales-details";
import { useParams } from "next/navigation";
export default function Page() { const { employeeId } = useParams<{ employeeId: string }>(); return <PerformanceReportPage mode="employee" employeeId={employeeId} salesDetails={<SalesDetails />} />; }
