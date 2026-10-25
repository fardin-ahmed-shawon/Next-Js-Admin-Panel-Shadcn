"use client";
import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetchClient } from "@/lib/fetch-client";
import { discountApi } from "@/hooks/useCustomDiscount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card,CardContent } from "@/components/ui/card";
import { Table,TableHeader,TableHead,TableBody,TableRow,TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
const money=(n:any)=>n==null?"Unlimited":"৳"+Number(n).toLocaleString("en-BD",{maximumFractionDigits:2});
const today=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Dhaka"});
function Pager({data,onPage}: {data:any;onPage:(n:number)=>void}){
 return <div className="flex flex-wrap justify-between items-center gap-3 border-t p-4 text-sm"><span>{data?.from||0}–{data?.to||0} of {data?.total||0}</span><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={!data||data.current_page<=1} onClick={()=>onPage(data.current_page-1)}>Previous</Button><span>{data?.current_page||1} / {data?.last_page||1}</span><Button variant="outline" size="sm" disabled={!data||data.current_page>=data.last_page} onClick={()=>onPage(data.current_page+1)}>Next</Button></div></div>;
}
export default function DiscountReport(){
 const [from,setFrom]=React.useState(today);const [to,setTo]=React.useState(today);
 const [department,setDepartment]=React.useState("");const [designation,setDesignation]=React.useState("");const [employee,setEmployee]=React.useState("");const [search,setSearch]=React.useState("");const [query,setQuery]=React.useState("");
 const [page,setPage]=React.useState(1);const [historyPage,setHistoryPage]=React.useState(1);const [size,setSize]=React.useState("20");const [sort,setSort]=React.useState("consumed");
 React.useEffect(()=>{const t=setTimeout(()=>setQuery(search),250);return()=>clearTimeout(t);},[search]);
 React.useEffect(()=>{setPage(1);setHistoryPage(1);},[from,to,department,designation,employee,query,size,sort]);
 const params=new URLSearchParams({page:String(page),history_page:String(historyPage),per_page:size,sort});
 for(const [key,value] of Object.entries({start_date:from,end_date:to,department_id:department,designation_id:designation,employee_id:employee,search:query})){if(value)params.set(key,value);}
 const {data,error,isLoading,mutate}=useSWR(discountApi+"/discount-report?"+params.toString(),async url=>{const r=await fetchClient(url);const j=await r.json();if(!r.ok)throw Error(j.message||"Unable to load discount report");return j.data;},{refreshInterval:30000});
 const options:any[]=data?.options||[];
 const departments=[...new Map(options.filter(e=>e.department_id).map(e=>[String(e.department_id),String(e.department_name)])).entries()];
 const designations=[...new Map(options.filter(e=>e.designation_id&&(!department||String(e.department_id)===department)).map(e=>[String(e.designation_id),String(e.designation_name)])).entries()];
 const summary=data?.summary;
 const select="h-9 w-full rounded-md border bg-background px-3 text-sm";
 return <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold">Discount Report</h1><p className="text-sm text-muted-foreground">Employee custom discounts, daily allowances, and order-level usage.</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>mutate()}>Refresh</Button><Button asChild variant="outline"><Link href="/dashboard/discounts">Discount Settings</Link></Button></div></div>
 <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
 <div className="space-y-1"><Label htmlFor="discount-from">From date</Label><Input id="discount-from" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div>
 <div className="space-y-1"><Label htmlFor="discount-to">To date</Label><Input id="discount-to" type="date" min={from||undefined} value={to} onChange={e=>setTo(e.target.value)}/></div>
 <div className="space-y-1"><Label htmlFor="report-department">Department</Label><select id="report-department" className={select} value={department} onChange={e=>{setDepartment(e.target.value);setDesignation("");setEmployee("");}}><option value="">All Departments</option>{departments.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
 <div className="space-y-1"><Label htmlFor="report-designation">Designation</Label><select id="report-designation" className={select} value={designation} onChange={e=>{setDesignation(e.target.value);setEmployee("");}}><option value="">All Designations</option>{designations.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
 <div className="space-y-1"><Label htmlFor="report-employee">Employee</Label><select id="report-employee" className={select} value={employee} onChange={e=>setEmployee(e.target.value)}><option value="">All Employees</option>{options.filter(e=>(!department||String(e.department_id)===department)&&(!designation||String(e.designation_id)===designation)).map(e=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
 <div className="space-y-1"><Label htmlFor="discount-search">Search employee</Label><Input id="discount-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Employee name…"/></div>
 <div className="space-y-1"><Label htmlFor="discount-sort">Sort employees by</Label><select id="discount-sort" className={select} value={sort} onChange={e=>setSort(e.target.value)}><option value="consumed">Period consumption</option><option value="today">Today’s consumption</option><option value="name">Employee name</option></select></div>
 <div className="flex items-end gap-2"><Button variant="outline" onClick={()=>{setFrom(today());setTo(today());}}>Today</Button><Button variant="outline" onClick={()=>{setFrom("");setTo("");}}>All Time</Button><select aria-label="Rows per page" className={select} value={size} onChange={e=>setSize(e.target.value)}>{[20,50,100].map(n=><option key={n} value={n}>{n} rows</option>)}</select></div>
 </CardContent></Card>
 {error?<Card><CardContent className="p-5 flex justify-between"><p role="alert" className="text-destructive">{error.message}</p><Button onClick={()=>mutate()}>Retry</Button></CardContent></Card>:isLoading?<div className="h-80 animate-pulse rounded-lg bg-muted"/>:<>
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
 ["Period Discount Consumed",money(summary?.period_consumed),String(summary?.period_actions||0)+" applications · "+String(summary?.period_orders||0)+" orders"],
 ["Company Daily Limit",money(summary?.company_daily_limit),"Current configuration"],
 ["Company Used Today",money(summary?.company_today_used),summary?.today+" · all employees"],
 ["Company Remaining Today",money(summary?.company_today_remaining),"Shared allowance across all employees"]
 ].map(([title,value,description])=><Card key={title}><CardContent className="p-4 space-y-2"><p className="text-sm text-muted-foreground">{title}</p><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{description}</p></CardContent></Card>)}</div>
 <div className="flex flex-wrap gap-3 text-sm"><Badge variant={summary?.enabled?"secondary":"destructive"}>Custom Discounts {summary?.enabled?"On":"Off"}</Badge><span>Per-order maximum: {summary?.order_limit==null?"Unlimited":summary.order_limit_type==="percentage"?summary.order_limit+"% of subtotal":money(summary.order_limit)}</span></div>
 <Card className="overflow-hidden"><div className="p-4"><h2 className="font-semibold">Employee Discount Breakdown</h2><p className="text-xs text-muted-foreground">Limits and available balances refer to today. Period consumption follows your date filters.</p></div><div className="overflow-x-auto"><Table><TableHeader><TableRow>{["SL No.","Employee","Department / Designation","Daily Limit","Used Today","Employee Remaining","Available Today","Period Consumed","Orders","Applications"].map(h=><TableHead key={h} className="whitespace-nowrap">{h}</TableHead>)}</TableRow></TableHeader><TableBody>{data?.employees?.data?.map((e:any,i:number)=><TableRow key={e.id}><TableCell>{(data.employees.from||1)+i}</TableCell><TableCell><span className="font-medium">{e.full_name}</span><span className="block text-xs text-muted-foreground">{e.status}</span></TableCell><TableCell>{e.department_name||"—"}<span className="block text-xs text-muted-foreground">{e.designation_name||"—"}</span></TableCell><TableCell>{money(e.daily_limit)}</TableCell><TableCell>{money(e.today_used)}</TableCell><TableCell>{money(e.remaining)}</TableCell><TableCell className="font-semibold">{money(e.available_today)}</TableCell><TableCell>{money(e.consumed)}</TableCell><TableCell>{e.orders_count}</TableCell><TableCell>{e.actions_count}</TableCell></TableRow>)}{!data?.employees?.data?.length&&<TableRow><TableCell colSpan={10} className="py-8 text-center">No matching employees.</TableCell></TableRow>}</TableBody></Table></div><Pager data={data?.employees} onPage={setPage}/></Card>
 <Card className="overflow-hidden"><div className="p-4"><h2 className="font-semibold">Discount Application History</h2><p className="text-xs text-muted-foreground">Each row records the new discount or increase charged to an employee’s allowance.</p></div><Table><TableHeader><TableRow>{["Date (Bangladesh)","Employee","Order","Allowance Consumed"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{data?.history?.data?.map((h:any)=><TableRow key={h.id}><TableCell>{h.usage_date}</TableCell><TableCell>{h.full_name||"Deleted employee"}</TableCell><TableCell className="font-medium">{h.order_no}</TableCell><TableCell>{money(h.amount)}</TableCell></TableRow>)}{!data?.history?.data?.length&&<TableRow><TableCell colSpan={4} className="py-8 text-center">No discount applications in this period.</TableCell></TableRow>}</TableBody></Table><Pager data={data?.history} onPage={setHistoryPage}/></Card>
 <p className="text-xs text-muted-foreground">Available today is limited by both employee and company allowance; it is shared, not reserved. Disabled discounts and inactive employees show zero availability. Consumption is tracked from the introduction of discount limits. Reductions and cancellations do not restore allowance. Historical rows use current employee departments and designations.</p>
 </>}
 </div>;
}
