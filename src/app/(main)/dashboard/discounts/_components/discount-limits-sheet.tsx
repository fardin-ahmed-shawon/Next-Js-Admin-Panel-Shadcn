"use client";
import * as React from "react";
import useSWR,{mutate} from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { discountApi } from "@/hooks/useCustomDiscount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
export function DiscountLimitsSheet(){
 const [open,setOpen]=React.useState(false);const [saving,setSaving]=React.useState(false);const [search,setSearch]=React.useState("");
 const [form,setForm]=React.useState({enabled:true,daily_limit:"",order_limit_type:"amount",order_limit:""});
 const [department,setDepartment]=React.useState("");
 const [designation,setDesignation]=React.useState("");
 const [page,setPage]=React.useState(1);
 const [pageSize,setPageSize]=React.useState(10);
 const [bulkAmount,setBulkAmount]=React.useState("");
 const [limits,setLimits]=React.useState<Record<string,string>>({});
 const {data,error,isLoading,mutate:reload}=useSWR(open?discountApi+"/custom-discount-settings":null,async url=>{const r=await fetchClient(url);if(!r.ok)throw Error("Unable to load settings. Discounts access is required.");return (await r.json()).data;},{revalidateOnFocus:false,revalidateOnReconnect:false});
 React.useEffect(()=>{if(data){setForm({enabled:!!data.settings.enabled,daily_limit:data.settings.daily_limit??"",order_limit_type:data.settings.order_limit_type,order_limit:data.settings.order_limit??""});setLimits(Object.fromEntries(data.employee_limits.map((l:any)=>[String(l.user_id),String(l.daily_limit)])));}},[data]);
 const employees: {id:number;full_name:string;status:string;department_id:number|null;designation_id:number|null;department_name:string|null;designation_name:string|null}[]=data?.employees || [];
 const departments=[...new Map(employees.filter(e=>e.department_id).map(e=>[String(e.department_id),e.department_name || "Department"])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
 const designations=[...new Map(employees.filter(e=>e.designation_id && (!department || String(e.department_id)===department)).map(e=>[String(e.designation_id),e.designation_name || "Designation"])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
 const filtered=employees.filter(e=>(!department || String(e.department_id)===department) && (!designation || String(e.designation_id)===designation) && e.full_name.toLowerCase().includes(search.trim().toLowerCase()));
 const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
 const currentPage=Math.min(page,pageCount);
 const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
 React.useEffect(()=>setPage(1),[search,department,designation,pageSize]);
 function applyBulk(){
  if(bulkAmount!=="" && (!Number.isFinite(Number(bulkAmount)) || Number(bulkAmount)<0 || Number(bulkAmount)>999999999)){toast.error("Enter a limit between 0 and 999,999,999.");return;}
  setLimits(previous=>{const next={...previous};for(const employee of filtered)next[employee.id]=bulkAmount;return next;});
  toast.success("Updated "+filtered.length+" employee limits. Save to apply changes.");
 }
 async function save(e:React.FormEvent){e.preventDefault();setSaving(true);try{
 const r=await fetchClient(discountApi+"/custom-discount-settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,daily_limit:form.daily_limit===""?null:Number(form.daily_limit),order_limit:form.order_limit===""?null:Number(form.order_limit),employee_limits:Object.entries(limits).filter(([,v])=>v!=="").map(([user_id,daily_limit])=>({user_id:Number(user_id),daily_limit:Number(daily_limit)}))})});
 const j=await r.json();if(!r.ok)throw Error(Object.values(j.errors||{}).flat().join(" ")||j.message||"Unable to save");await reload();await mutate(discountApi+"/custom-discount-availability");toast.success("Discount limits saved");setOpen(false);
 }catch(e){toast.error(e instanceof Error?e.message:"Unable to save");}finally{setSaving(false);}}
 return <><Button variant="outline" onClick={()=>setOpen(true)}>Discount Limits</Button><Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"><SheetHeader className="px-5 pt-5 pb-3 pr-12"><SheetTitle className="text-xl font-bold">Custom Discount Limits</SheetTitle><SheetDescription>Controls manual discounts on Create and Edit / View Order. Daily limits reset at midnight in Bangladesh.</SheetDescription></SheetHeader>
 {error?<div className="p-5"><p role="alert">{error.message}</p><Button onClick={()=>reload()}>Retry</Button></div>:isLoading?<div className="m-5 h-64 animate-pulse rounded bg-muted"/>:<form className="space-y-5 px-5 pb-5 pt-0" onSubmit={save}>
 <div className="flex justify-between items-center rounded-lg border p-4"><Label htmlFor="custom-discount-on">Enable Custom Discounts</Label><Switch id="custom-discount-on" checked={form.enabled} onCheckedChange={enabled=>setForm({...form,enabled})}/></div>
 <div className="space-y-2"><Label htmlFor="discount-daily">Company Daily Discount Limit (৳)</Label><Input id="discount-daily" type="number" min="0" step="0.01" placeholder="Unlimited" value={form.daily_limit} onChange={e=>setForm({...form,daily_limit:e.target.value})}/></div>
 <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="discount-mode">Per-order limit type</Label><select id="discount-mode" className="h-9 w-full rounded-md border bg-background px-3" value={form.order_limit_type} onChange={e=>setForm({...form,order_limit_type:e.target.value,order_limit:""})}><option value="amount">Amount (৳)</option><option value="percentage">Percentage (%)</option></select></div><div className="space-y-2"><Label htmlFor="discount-order-limit">Maximum per order</Label><Input id="discount-order-limit" type="number" min="0" max={form.order_limit_type==="percentage"?100:undefined} step="0.01" placeholder="Unlimited" value={form.order_limit} onChange={e=>setForm({...form,order_limit:e.target.value})}/></div></div>
 <p className="text-xs text-muted-foreground">Percentage limits use the product subtotal before shipping. Blank means no additional limit; 0 blocks discounts. All limits apply together.</p>
 <div className="space-y-3 border-t pt-4">
  <h3 className="font-semibold">Employee Daily Limits</h3>
  <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
   <Label htmlFor="bulk-employee-limit">Quick set daily limit (৳)</Label>
   <div className="flex gap-2"><Input id="bulk-employee-limit" type="number" min="0" max="999999999" step="0.01" placeholder="Unlimited" value={bulkAmount} onChange={e=>setBulkAmount(e.target.value)}/><Button type="button" variant="outline" disabled={!filtered.length || saving} onClick={applyBulk}>Set All ({filtered.length})</Button></div>
   <p className="text-xs text-muted-foreground">Applies to all matching employees across every page. Blank sets Unlimited; 0 blocks discounts. Save below to apply.</p>
  </div>
  <div className="grid grid-cols-2 gap-3">
   <div className="space-y-1"><Label htmlFor="limit-department">Department</Label><select id="limit-department" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={department} onChange={e=>{setDepartment(e.target.value);setDesignation("");}}><option value="">All Departments</option>{departments.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
   <div className="space-y-1"><Label htmlFor="limit-designation">Designation</Label><select id="limit-designation" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={designation} onChange={e=>setDesignation(e.target.value)}><option value="">All Designations</option>{designations.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
  </div>
  <Input aria-label="Search employee" placeholder="Search employee…" value={search} onChange={e=>setSearch(e.target.value)}/>
  <div className="max-h-80 overflow-y-auto space-y-2">{visible.map(e=><div key={e.id} className="flex items-center justify-between gap-3 rounded-md border p-3"><Label htmlFor={"employee-limit-"+e.id} className="min-w-0">{e.full_name}<span className="block text-xs text-muted-foreground">{e.department_name || "No department"} · {e.designation_name || "No designation"} · {e.status}</span></Label><Input id={"employee-limit-"+e.id} className="w-32 shrink-0" type="number" min="0" step="0.01" placeholder="Unlimited" value={limits[e.id]??""} onChange={event=>setLimits({...limits,[e.id]:event.target.value})}/></div>)}{!filtered.length && <p className="py-4 text-center text-sm text-muted-foreground">No matching employees.</p>}</div>
  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
   <span>{filtered.length ? (currentPage-1)*pageSize+1 : 0}–{Math.min(currentPage*pageSize,filtered.length)} of {filtered.length}</span>
   <select aria-label="Employees per page" className="h-8 rounded border bg-background px-2" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>{[10,20,50].map(n=><option key={n} value={n}>{n} / page</option>)}</select>
   <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>Previous</Button><span>{currentPage}/{pageCount}</span><Button type="button" variant="outline" size="sm" disabled={currentPage>=pageCount} onClick={()=>setPage(currentPage+1)}>Next</Button></div>
  </div>
 </div>
 <p className="text-xs text-muted-foreground">Only new discounts and increases consume daily allowance. Reductions and cancellations do not restore allowance. Existing discounts are retained when disabled.</p>
 <Button className="w-full" disabled={saving||!data}>{saving?"Saving…":"Save Discount Limits"}</Button>
 </form>}</SheetContent></Sheet></>;
}
