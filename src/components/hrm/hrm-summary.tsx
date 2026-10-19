import styles from "./hrm-page.module.css";
export function HrmSummary({ items, loading = false }: { items: { label: string; value: number | string; hint: string }[]; loading?: boolean }) {
  return <div className={styles.stats} aria-label="Summary">{items.map(item => <div className={styles.stat} key={item.label}><p className={styles.statLabel}>{item.label}</p><p className={styles.statValue}>{loading ? <span className="block h-7 w-20 animate-pulse rounded bg-muted" /> : typeof item.value === "number" ? item.value.toLocaleString() : item.value}</p><p className={styles.statHint}>{item.hint}</p></div>)}</div>;
}
