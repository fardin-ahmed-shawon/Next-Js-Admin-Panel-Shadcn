"use client";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess, hasAllUserAccess } from "@/hooks/useRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkHourPolicyEditor } from "@/components/hrm/work-hour-policy-editor";
import SalaryManagement from "@/components/hrm/salary-management";
export default function Page() {
 const {user} = useAuth();
 const canIncentives = hasModuleAccess(user, "hrm_salaries");
 if(!canIncentives && !hasAllUserAccess(user, "cash_flow")) return <p className="text-muted-foreground">Salary & Payroll access is required to manage policies and rules.</p>;
 return <div className="space-y-6"><div><h1 className="text-3xl">Policy &amp; Rules</h1><p className="text-sm text-muted-foreground">Manage work hours, attendance deductions and employee incentives.</p></div>
 <Tabs defaultValue="hours"><TabsList><TabsTrigger value="hours">Work Hour Policy</TabsTrigger>{canIncentives && <TabsTrigger value="incentives">Incentive Rules</TabsTrigger>}</TabsList><TabsContent value="hours" className="pt-4"><WorkHourPolicyEditor /></TabsContent>{canIncentives && <TabsContent value="incentives" className="pt-4"><SalaryManagement rulesOnly /></TabsContent>}</Tabs></div>;
}
