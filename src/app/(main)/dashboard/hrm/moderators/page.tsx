"use client";
import * as React from "react";
import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card,CardContent } from "@/components/ui/card";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Table,TableHead,TableHeader,TableBody,TableRow,TableCell } from "@/components/ui/table";
import { toast } from "sonner";
const endpoint=(process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/,"")+"/hrm/moderators";
const empty={full_name:"",phone:"",email:"",status:"active"};
export default function ModeratorsPage(){
 const {data,error,isLoading,mutate}=useSWR(endpoint,async url=>{const r=await fetchClient(url);if(!r.ok)throw Error("Unable to load moderators. Check your HRM Employees access.");return (await r.json()).data;});
 const [search,setSearch]=React.useState("");const [open,setOpen]=React.useState(false);const [id,setId]=React.useState<number|null>(null);const [form,setForm]=React.useState(empty);const [saving,setSaving]=React.useState(false);
 async function save(e:React.FormEvent){e.preventDefault();setSaving(true);try{const r=await fetchClient(endpoint+(id?"/"+id:""),{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await r.json();if(!r.ok)throw Error(j.message||"Unable to save");await mutate();setOpen(false);toast.success("Moderator saved");}catch(e){toast.error(e instanceof Error?e.message:"Unable to save");}finally{setSaving(false);}}
 async function remove(id:number){if(!window.confirm("Delete this moderator? Existing order reports will retain their history."))return;const r=await fetchClient(endpoint+"/"+id,{method:"DELETE"});if(!r.ok){toast.error("Unable to delete moderator");return;}await mutate();toast.success("Moderator deleted");}
 const rows=(data||[]).filter((m:any)=>[m.full_name,m.email,m.phone].join(" ").toLowerCase().includes(search.toLowerCase()));
 return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-semibold">Moderators</h1><p className="text-sm text-muted-foreground">Manage moderators available when creating orders.</p></div><Button onClick={()=>{setId(null);setForm(empty);setOpen(true);}}>Add Moderator</Button></div>
 <Card><CardContent className="space-y-4 pt-4"><Input className="max-w-sm" placeholder="Search name, phone or email…" value={search} onChange={e=>setSearch(e.target.value)}/>{error?<p role="alert">{error.message}</p>:isLoading?<div className="h-40 animate-pulse bg-muted rounded"/>:<Table><TableHeader><TableRow>{["SL No.","Name","Phone","Email","Status","Actions"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((m:any,i:number)=><TableRow key={m.id}><TableCell>{i+1}</TableCell><TableCell className="font-medium">{m.full_name}</TableCell><TableCell>{m.phone||"—"}</TableCell><TableCell>{m.email||"—"}</TableCell><TableCell>{m.status}</TableCell><TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={()=>{setId(m.id);setForm({full_name:m.full_name,phone:m.phone||"",email:m.email||"",status:m.status});setOpen(true);}}>Edit</Button><Button size="sm" variant="outline" onClick={()=>remove(m.id)}>Delete</Button></TableCell></TableRow>)}{!rows.length&&<TableRow><TableCell colSpan={6} className="text-center py-8">No moderators found.</TableCell></TableRow>}</TableBody></Table>}</CardContent></Card>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle className="text-xl font-bold">{id?"Edit":"Add"} Moderator</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={save}>{(["full_name","phone","email"] as const).map(k=><div key={k} className="space-y-1"><Label htmlFor={k}>{k==="full_name"?"Name *":k==="phone"?"Phone":"Email"}</Label><Input id={k} required={k==="full_name"} type={k==="email"?"email":"text"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}<Label htmlFor="moderator-status">Status</Label><select id="moderator-status" className="h-9 w-full rounded border bg-background px-3" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select><div className="flex justify-end"><Button disabled={saving}>{saving?"Saving…":"Save"}</Button></div></form></DialogContent></Dialog></div>;
}
