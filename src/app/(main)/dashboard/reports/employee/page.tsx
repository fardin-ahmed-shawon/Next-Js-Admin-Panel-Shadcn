"use client";
import { PerformanceReportPage } from "@/components/hrm/performance-report-page";
import SalesDetails from "@/components/hrm/employee-sales-details";
import { Tabs,TabsList,TabsTrigger,TabsContent } from "@/components/ui/tabs";
export default function Page() { return <Tabs defaultValue="employees" className="space-y-4"><TabsList><TabsTrigger value="employees">Employee Report</TabsTrigger><TabsTrigger value="moderators">Moderator Report</TabsTrigger></TabsList><TabsContent value="employees"><PerformanceReportPage mode="employee" renderLayout={props => <SalesDetails {...props} />} /></TabsContent><TabsContent value="moderators"><SalesDetails moderator /></TabsContent></Tabs>; }
