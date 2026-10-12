"use client";
import { useState } from "react";
import { HISTORY_LABELS, historyDates, historyMinimum, type HistoryPeriod } from "@/lib/data-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function HistoryDateFilter({ label, periods, onChange }: { label: string; periods: HistoryPeriod[]; onChange: (dates: {from: string; to: string}) => void }) {
  const [period, setPeriod] = useState<HistoryPeriod | "">("");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const minimum = historyMinimum(periods);
  return <div className="flex flex-wrap items-end gap-3">
    <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label><Select disabled={!periods.length} value={period} onValueChange={value => { const next = value as HistoryPeriod; setPeriod(next); if (next !== "custom") onChange(historyDates(next)); }}><SelectTrigger aria-label={label} className="w-44"><SelectValue placeholder="Allowed history" /></SelectTrigger><SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{HISTORY_LABELS[p]}</SelectItem>)}</SelectContent></Select></div>
    {period === "custom" && <><Input aria-label={label + " from"} className="w-40" type="date" value={from} min={minimum} max={to || undefined} onChange={e => setFrom(e.target.value)} /><Input aria-label={label + " to"} className="w-40" type="date" value={to} min={from && (!minimum || from > minimum) ? from : minimum} onChange={e => setTo(e.target.value)} /><Button disabled={!from || !to || from > to || Boolean(minimum && from < minimum)} onClick={() => onChange({from, to})}>Apply</Button></>}
    <Button variant="ghost" onClick={() => { setPeriod(""); setFrom(""); setTo(""); onChange({from:"",to:""}); }}>Clear</Button>
  </div>;
}
