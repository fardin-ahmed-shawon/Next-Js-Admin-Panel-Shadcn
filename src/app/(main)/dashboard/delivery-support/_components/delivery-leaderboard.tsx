import { Crown, Medal, ShieldCheck } from "lucide-react";
import type { DeliveryRanking } from "@/hooks/useDeliverySupport";

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

export function DeliveryLeaderboard({ ranking, approved, total }: { ranking: DeliveryRanking[]; approved: number; total: number }) {
  return <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
      <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Crown className="size-4" /></span>
        <div><h2 className="text-sm font-semibold">Agent Leaderboard</h2><p className="text-xs text-muted-foreground">Support handlers ranked by approved resolutions within your access</p></div></div>
      <span className="hidden text-xs text-muted-foreground sm:block">Resolution rate</span>
    </div>
    {ranking.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">Assign an issue to a support handler to start the leaderboard.</p> :
      <div className="grid lg:grid-cols-[1.35fr_0.9fr]">
        <div className="bg-gradient-to-br from-muted/40 to-transparent p-5 pt-10 md:p-7 md:pt-10">
          <div className="grid grid-cols-3 items-end gap-3">{[1, 0, 2].map(index => {
            const person = ranking[index];
            if (!person) return <div key={index} />;
            return <div key={person.id} className="min-w-0 text-center">
              <div className={`relative flex flex-col items-center justify-end rounded-t-xl border px-2 pb-3 ${index === 0 ? "h-36 border-amber-200 bg-amber-50 dark:bg-amber-950/30" : index === 1 ? "h-28 bg-muted/60" : "h-24 border-orange-200 bg-orange-50 dark:bg-orange-950/30"}`}>
                {index === 0 && <Crown className="absolute -top-6 size-5 text-amber-500" />}
                <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-xs font-semibold shadow-sm">{initials(person.name)}</span>
                <p className="mt-2 w-full truncate text-xs font-semibold" title={person.name}>{person.name}</p><p className="text-[11px] text-muted-foreground">{person.resolved} approved</p>
              </div>
              <div className="flex h-9 items-center justify-center gap-1 rounded-b-lg bg-primary text-xs font-semibold text-primary-foreground"><Medal className="size-3.5" />{["1st", "2nd", "3rd"][index]}</div>
              <div className="mt-3 flex justify-between text-[11px] text-muted-foreground"><span>{person.rate}%</span><span>{person.total} total</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${person.rate}%` }} /></div>
            </div>;
          })}</div>
          <div className="mt-6 grid grid-cols-3 gap-3">{ranking.slice(0, 3).map((person, i) => <div key={person.id} className="min-w-0 rounded-xl border bg-background/70 p-3"><p className="truncate text-xs font-medium" title={person.name}>#{i + 1} {person.name}</p><p className="mt-2 text-lg font-semibold">{person.resolved}<span className="ml-1 text-[11px] font-normal text-muted-foreground">/ {person.total}</span></p></div>)}</div>
        </div>
        <div className="flex flex-col border-t bg-muted/20 p-4 lg:border-t-0 lg:border-l">
          <div className="mb-3 flex justify-between text-xs text-muted-foreground"><h3 className="font-semibold uppercase tracking-widest">Full ranking</h3><span>{ranking.length} handlers</span></div>
          <div className="max-h-64 space-y-2 overflow-y-auto">{ranking.slice(3).map((person, i) => <div key={person.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span className="text-xs text-muted-foreground">#{i + 4}</span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{initials(person.name)}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.resolved} approved · {person.total} assigned</p></div><span className="text-xs font-semibold">{person.rate}%</span>
          </div>)}{ranking.length <= 3 && <p className="py-8 text-center text-xs text-muted-foreground">All ranked handlers are shown on the podium.</p>}</div>
          <div className="mt-auto pt-4"><div className="flex items-center justify-between rounded-xl bg-primary p-4 text-sm text-primary-foreground"><span className="flex items-center gap-2"><ShieldCheck className="size-4" />Admin approvals</span><span className="font-semibold">{approved}/{total}</span></div></div>
        </div>
      </div>}
  </section>;
}
