"use client";
import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
export interface OrderPeople { owner: "customer" | "employee"; employeeId: string; moderatorId: string; canAdvance: boolean }
const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/, "");
export function OrderPeopleFields({ value, onChange, onEmployee }: { value: OrderPeople; onChange: (v: OrderPeople) => void; onEmployee: (e: any) => void }) {
 const {data,error,isLoading} = useSWR(base + "/order-people-options", async url => {const r=await fetchClient(url); if(!r.ok) throw Error("Unable to load employees and moderators"); return (await r.json()).data;});
 const [department,setDepartment]=React.useState(""); const [designation,setDesignation]=React.useState(""); const [search,setSearch]=React.useState("");
 const employees:any[]=data?.employees || [];
 const departments=[...new Map(employees.filter(e=>e.employee_detail?.department).map(e=>[String(e.employee_detail.department.id),e.employee_detail.department.name])).entries()];
 const designations=[...new Map(employees.filter(e=>(!department || String(e.employee_detail?.department_id)===department) && e.employee_detail?.designation).map(e=>[String(e.employee_detail.designation.id),e.employee_detail.designation.title])).entries()];
 const selectClass="h-9 w-full rounded-md border bg-background px-3 text-sm";
 return <div className="space-y-3 border-b pb-4">
  <div className="grid gap-3 sm:grid-cols-2">
   <div className="space-y-1.5"><Label htmlFor="order-owner-type">Order for</Label><select id="order-owner-type" className={selectClass} value={value.owner} onChange={e=>{onChange({...value,owner:e.target.value as OrderPeople["owner"],employeeId:"",canAdvance:false});onEmployee(null);}}><option value="customer">Customer</option><option value="employee">Employee</option></select></div>
   <div className="space-y-1.5"><Label htmlFor="order-moderator">Choose Moderator (Optional)</Label><select id="order-moderator" className={selectClass} value={value.moderatorId} onChange={e=>onChange({...value,moderatorId:e.target.value})}><option value="">No moderator</option>{data?.moderators?.map((m:any)=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div>
  </div>
  {isLoading && <p className="text-xs text-muted-foreground">Loading people…</p>}
  {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
  {value.owner==="employee" && <div className="space-y-3">
   <div className="grid gap-3 sm:grid-cols-2"><select aria-label="Employee department" className={selectClass} value={department} onChange={e=>{setDepartment(e.target.value);setDesignation("");}}><option value="">All departments</option>{departments.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><select aria-label="Employee designation" className={selectClass} value={designation} onChange={e=>setDesignation(e.target.value)}><option value="">All designations</option>{designations.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
   <Input aria-label="Search employee" placeholder="Search employee name, phone or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
   <select aria-label="Choose employee" className={selectClass} value={value.employeeId} onChange={e=>{const employee=employees.find(x=>String(x.id)===e.target.value);onChange({...value,employeeId:e.target.value,canAdvance:!!employee?.can_create_advance});onEmployee(employee);}}>
    <option value="">Choose employee</option>{employees.filter(e=>String(e.id)===value.employeeId || ((!department || String(e.employee_detail?.department_id)===department) && (!designation || String(e.employee_detail?.designation_id)===designation) && [e.full_name,e.phone,e.email].join(" ").toLowerCase().includes(search.toLowerCase()))).map(e=><option key={e.id} value={e.id}>{e.full_name} · {e.phone}</option>)}
   </select>
   <p className="text-xs text-muted-foreground">This order belongs to an employee and will not create a customer record. Enter the delivery address below.</p>
  </div>}
 </div>;
}
