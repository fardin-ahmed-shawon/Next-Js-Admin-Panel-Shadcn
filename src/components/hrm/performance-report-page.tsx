"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { PerformanceLayoutProps } from "./performance-layout";
import { PerformancePodium } from "./performance-podium";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import Link from "next/link";
import { ArrowDown, ArrowUp, BarChart3, ChevronRight, Loader2, Search, Users, PackageCheck, RotateCcw, MessageSquare } from "lucide-react";
import { fetchClient } from "@/lib/fetch-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GROUPS = {
  sales: { label: "Sales", fields: { assigned_orders: "Assigned orders", confirmed_orders: "Confirmed", delivered_orders: "Delivered", sales_units: "Order units", sales_revenue: "Delivered revenue", upsell_count: "Eligible upsells", upsell_value: "Upsell value" } },
  packing: { label: "Packaging", fields: { packed_orders: "Packed orders", packed_units: "Packed units", courier_parcels: "Courier parcels", courier_units: "Courier units" } },
  returns: { label: "Returns", fields: { returned_orders: "Returned orders", returned_units: "Returned units" } },
  support_handled: { label: "Support", fields: { issues_resolved: "Approved resolutions", issues_unresolved: "Unresolved", awaiting_approval: "Awaiting approval" } },
};
type Group = keyof typeof GROUPS;
type Employee = { user_id: number; name: string; email: string; department_id: number | null; department_name: string; designation: string | null; groups: Group[]; metrics: Record<string, number> };
type Department = { department_id: number | null; name: string; employees: number; groups: Group[]; metrics: Record<string, number> };
type Report = { rows: Employee[]; departments: Department[]; summary: Record<string, number>; total_employees: number };
const endpoints = { employee: "employee-reports", department: "hrm/department-performance", leaderboard: "hrm/leaderboard" };
const titles = { employee: "Employee Report", department: "Department Performance", leaderboard: "Leaderboard" };
const format = (key: string, value: number) => `${key.includes("revenue") || key.includes("value") ? "৳" : ""}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function PerformanceReportPage({ mode, employeeId, salesDetails, renderLayout }: { mode: keyof typeof endpoints; employeeId?: string; salesDetails?: ReactNode; renderLayout?: (props: PerformanceLayoutProps) => ReactNode }) {
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [period, setPeriod] = useState("all");
  const [layoutDates, setLayoutDates] = useState<{ start?: string; end?: string }>({});
  const onDatesChange = useCallback((dates: { start?: string; end?: string }) => setLayoutDates(dates), []);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [selectedGroup, setGroup] = useState<Group | null>(null);
  const [sortKey, setSortKey] = useState("");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("25");
  const params = new URLSearchParams({ performance: "1" });
  if (employeeId) params.set("employee_id", employeeId);
  if (renderLayout) {
    if (layoutDates.start) params.set("start_date", layoutDates.start);
    if (layoutDates.end) params.set("end_date", layoutDates.end);
  } else if (period === "custom") {
    if (from) params.set("start_date", from);
    if (to) params.set("end_date", to);
  } else if (period !== "all") {
    const end = new Date(); const start = new Date(end);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "week") start.setDate(start.getDate() - 6);
    else start.setDate(1);
    params.set("start_date", localDate(start)); params.set("end_date", localDate(end));
  }
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${endpoints[mode]}?${params}`;
  const { data, error, isLoading, mutate } = useSWR<Report>(url, async (url: string) => {
    const response = await fetchClient(url);
    const body = await response.json().catch(() => null);
    if (response.status === 401) throw new Error("Your session could not be authenticated. Please sign in again.");
    if (response.status === 403) throw new Error(body?.message || "Your role does not have access to this report.");
    if (!response.ok) throw new Error(response.status === 422
      ? body?.message || "Please check the selected report filters."
      : `Unable to load performance (HTTP ${response.status}). Please retry or contact your administrator.`);
    if (!body?.data || !Array.isArray(body.data.rows)) throw new Error("The report API returned an unexpected response. Please check that the Admin API is up to date.");
    return body.data;
  });
  const availableGroups = (Object.keys(GROUPS) as Group[]).filter(group => data?.rows.some(row => row.groups.includes(group) && (department === "all" || String(row.department_id) === department)));
  const activeGroup = selectedGroup && availableGroups.includes(selectedGroup) ? selectedGroup : availableGroups[0];
  const fields = activeGroup ? Object.entries(GROUPS[activeGroup].fields) : [];
  const sort = fields.some(([key]) => key === sortKey) ? sortKey : fields[0]?.[0];
  const employees = useMemo(() => (data?.rows || []).filter(row =>
    (department === "all" || String(row.department_id) === department)
    && `${row.name} ${row.email} ${row.designation || ""}`.toLowerCase().includes(search.toLowerCase())), [data, department, search]);
  const employeeRows = employees.filter(row => activeGroup && row.groups.includes(activeGroup));
  const departmentRows = (data?.departments || []).filter(row => activeGroup && row.groups.includes(activeGroup)
    && (department === "all" || String(row.department_id) === department) && row.name.toLowerCase().includes(search.toLowerCase()));
  const rows = [...(mode === "department" ? departmentRows : employeeRows)].sort((a, b) =>
    ((a.metrics[sort] || 0) - (b.metrics[sort] || 0)) * (ascending ? 1 : -1) || a.name.localeCompare(b.name));
  const totals = fields.map(([key, label]) => ({ key, label, value: key === "returned_orders" && !search ? (department === "all" ? (data?.summary[key] || 0) : (data?.departments.find(row => String(row.department_id) === department)?.metrics[key] || 0)) : rows.reduce((sum, row) => sum + (row.metrics[key] || 0), 0) }));
  const pages = Math.max(1, Math.ceil(rows.length / Number(pageSize)));
  const currentPage = Math.min(page, pages);
  const visibleRows = rows.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));
  function chooseGroup(group: Group) { setGroup(group); setSortKey(""); setAscending(false); setPage(1); }
  const MetricIcon = activeGroup === "packing" ? PackageCheck : activeGroup === "returns" ? RotateCcw : activeGroup?.startsWith("support") ? MessageSquare : BarChart3;

  const groupLabel = (group: Group) => mode === "employee" ? ({ sales: "Order Agent", packing: "Packing By", returns: "Return Confirmed By", support_handled: "Support" })[group] : GROUPS[group].label;
  const controls = <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
    <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">{mode === "employee" ? "Employee performance by" : "Performance type"}</p><div className="flex flex-wrap gap-2" role="tablist" aria-label="Performance type">{availableGroups.map(group => <Button size="sm" role="tab" aria-selected={activeGroup === group} key={group} variant={activeGroup === group ? "default" : "outline"} onClick={() => chooseGroup(group)}>{groupLabel(group)}</Button>)}</div></div>
    <label className="ml-auto space-y-2 text-xs font-medium text-muted-foreground"><span>Department</span><Select value={department} onValueChange={value => { setDepartment(value); setPage(1); }}><SelectTrigger className="w-56" aria-label="Department"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{data?.departments.map(row => <SelectItem key={String(row.department_id)} value={String(row.department_id)}>{row.name}</SelectItem>)}</SelectContent></Select></label>
  </div>;
  const content = <div className="space-y-6">
    {error ? <Card><CardContent className="flex items-center justify-between gap-4 py-6"><p role="alert" className="text-destructive">{error.message}</p><Button variant="outline" onClick={() => mutate()}>Retry</Button></CardContent></Card>
      : isLoading ? <div className="flex items-center justify-center gap-2 py-20"><Loader2 className="size-5 animate-spin" />Loading performance…</div>
      : <>

        {activeGroup ? <>
          {activeGroup === "sales" && salesDetails && <div><Button variant="outline" onClick={() => setShowSalesDetails(!showSalesDetails)}>{showSalesDetails ? "Hide" : "Open"} detailed sales report</Button>{showSalesDetails && <div className="mt-4 rounded-xl border p-4">{salesDetails}</div>}</div>}
          <div className={mode === "leaderboard" ? "grid grid-cols-1 overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>{totals.map((metric, index) => <div key={metric.key} className={mode === "leaderboard" ? "relative border-b p-5 xl:border-b-0 xl:border-r last:border-r-0" : "relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs"}>
            {mode === "department" && <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5" />}
            <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{metric.label}</p><MetricIcon className={index % 2 ? "size-4 text-emerald-500" : "size-4 text-amber-500"} /></div>
            <p className={`mt-3 text-3xl font-semibold tabular-nums ${index % 2 ? "text-emerald-600" : ""}`}>{format(metric.key, metric.value)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{department === "all" ? "Across visible departments" : "Within selected department"}</p>
          </div>)}</div>
          {mode === "leaderboard" && <PerformancePodium employees={employeeRows} fields={fields} sortKey={sort} ascending={ascending} />}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="size-5" />{mode === "department" ? "Department Breakdown & Comparison" : mode === "leaderboard" ? "Employee Rankings" : "Employee Breakdown"}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{rows.length} {mode === "department" ? "departments" : "employees"} · Select a column to sort</p></div>
              <Select value={pageSize} onValueChange={value => { setPageSize(value); setPage(1); }}><SelectTrigger className="w-28" aria-label="Rows per page"><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n} rows</SelectItem>)}</SelectContent></Select>
            </CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-3 px-6 pb-4">
              <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search performance" className="pl-9" placeholder={mode === "department" ? "Search department…" : "Search employee, email, designation…"} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
              <label className="space-y-1 text-xs text-muted-foreground"><span>Sort by</span><Select value={sort || ""} onValueChange={value => { setSortKey(value); setAscending(false); setPage(1); }}><SelectTrigger className="w-56" aria-label="Sort performance"><SelectValue /></SelectTrigger><SelectContent>{fields.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <CardContent className="px-0"><Table><TableHeader className="bg-muted/40"><TableRow>{mode === "leaderboard" && <TableHead className="pl-5">Rank</TableHead>}<TableHead className="pl-5">{mode === "department" ? "Department" : "Employee"}</TableHead>{fields.map(([key, label]) => <TableHead key={key} className="text-right"><button className="inline-flex items-center gap-1 whitespace-nowrap py-2" onClick={() => { setSortKey(key); setAscending(sort === key ? !ascending : false); }}>{label}{sort === key && (ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}</button></TableHead>)}{mode !== "department" && !employeeId && <TableHead />}</TableRow></TableHeader>
              <TableBody>{visibleRows.map((row) => <TableRow key={"user_id" in row ? row.user_id : String(row.department_id)}>
                {mode === "leaderboard" && <TableCell className="pl-5 font-semibold text-muted-foreground">{rows.findIndex(item => item.metrics[sort] === row.metrics[sort]) + 1}</TableCell>}
                <TableCell className="pl-5"><div className="flex items-center gap-3">{"user_id" in row && <Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-xs">{row.name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("")}</AvatarFallback></Avatar>}<div><div className="font-semibold">{row.name}</div>{"email" in row && <p className="text-xs text-muted-foreground">{row.email}</p>}<div className="mt-1 text-xs text-muted-foreground">{"user_id" in row ? <><Badge variant="secondary">{row.department_name}</Badge>{row.designation && ` · ${row.designation}`}</> : `${row.employees} employees`}</div></div></div></TableCell>
                {fields.map(([key]) => <TableCell key={key} className="text-right font-medium tabular-nums">{key in row.metrics ? format(key, row.metrics[key]) : <span aria-label="Not applicable">—</span>}</TableCell>)}
                {mode !== "department" && !employeeId && "user_id" in row && <TableCell><Button size="sm" variant="ghost" asChild><Link href={`/dashboard/reports/employee/${row.user_id}`}>Details<ChevronRight className="size-3" /></Link></Button></TableCell>}
              </TableRow>)}{!rows.length && <TableRow><TableCell colSpan={fields.length + 3} className="h-32 text-center text-muted-foreground">No matching performance data.</TableCell></TableRow>}</TableBody></Table>
              <div className="mt-4 flex items-center justify-between border-t px-5 pt-4 text-xs text-muted-foreground"><span>Page {currentPage} of {pages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>
            </CardContent>
          </Card>
          <p className="text-xs leading-relaxed text-muted-foreground">{activeGroup === "packing" ? "Packing is credited once to the employee who confirms packing or marks Ready to Ship. Courier totals use the dispatch date and retain the original packer. Units are the sum of product quantities." : activeGroup === "returns" ? "Return work uses actual receipts: each employee’s distinct orders and received quantities. Two employees handling different items on one order each receive credit. Department totals count distinct orders." : activeGroup.startsWith("support") ? "Support performance belongs to the assigned handler and uses the issue creation date. Approved resolutions, unresolved issues, and issues awaiting approval are counted separately." : "Sales uses orders assigned during the selected period and their current status. Revenue includes delivered order value; upsells include eligible value only."}</p>
        </> : <Card><CardContent className="flex flex-col items-center gap-3 py-14 text-muted-foreground"><Users className="size-8" /><p>No applicable performance metrics are enabled for these employees.</p><p className="text-xs">Configure employee roles under Performance metrics in Roles & Permission.</p></CardContent></Card>}
      </>}
  </div>;
  if (renderLayout) return renderLayout({ performanceControls: controls, performanceContent: !error && !isLoading && activeGroup === "sales" ? undefined : content, onDatesChange, onPerformanceRefresh: () => { mutate(); }, departmentId: department, employeeIds: (data?.rows || []).filter(row => department === "all" || String(row.department_id) === department).map(row => row.user_id) });
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight">{employeeId ? "Employee Performance" : titles[mode]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Results within your access. Only metrics enabled for each employee’s role are shown.</p></div>
      <div className="flex flex-wrap items-end gap-2">
        {period === "custom" && <><label className="text-xs">From<Input aria-label="From date" type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label className="text-xs">To<Input aria-label="To date" type="date" value={to} onChange={e => setTo(e.target.value)} /></label></>}
        <Select value={period} onValueChange={value => { setPeriod(value); setPage(1); }}><SelectTrigger className="w-40" aria-label="Report period"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="today">Today</SelectItem><SelectItem value="week">Last 7 days</SelectItem><SelectItem value="month">This month</SelectItem><SelectItem value="all">All time</SelectItem><SelectItem value="custom">Custom range</SelectItem>
        </SelectContent></Select>
      </div>
    </div>
    {controls}{content}
  </div>;
}
