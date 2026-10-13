import { BarChart3, ShieldCheck } from "lucide-react";

export const PERFORMANCE_PERMISSION_GROUPS = [
  {
    id: "performance_metrics", title: "Performance metrics for employees in this role", icon: BarChart3,
    items: [
      { id: "performance_sales", label: "Sales — Orders, Revenue & Upsells", icon: BarChart3 },
      { id: "performance_packing", label: "Packaging — Packed Orders, Units & Courier Parcels", icon: BarChart3 },
      { id: "performance_returns", label: "Returns — Received Orders & Units", icon: BarChart3 },
      { id: "performance_support_raised", label: "Support — Issues Raised & Their Outcomes", icon: BarChart3 },
      { id: "performance_support_handled", label: "Support — Approved Resolutions & Open Work", icon: BarChart3 },
    ],
  },
  {
    id: "performance_visibility", title: "Performance report visibility", icon: ShieldCheck,
    items: [
      { id: "employee_report_reporting_team", label: "Employee Report — Reporting Team", icon: ShieldCheck },
      { id: "employee_report_all", label: "Employee Report — All Employees", icon: ShieldCheck },
      { id: "hrm_team_leaderboard", label: "Leaderboard — Reporting Team", icon: ShieldCheck },
      { id: "hrm_all_leaderboard", label: "Leaderboard — All Employees", icon: ShieldCheck },
      { id: "hrm_team_department_performance", label: "Dept Performance — Reporting Team", icon: ShieldCheck },
      { id: "hrm_all_department_performance", label: "Dept Performance — All Employees", icon: ShieldCheck },
    ],
  },
];
