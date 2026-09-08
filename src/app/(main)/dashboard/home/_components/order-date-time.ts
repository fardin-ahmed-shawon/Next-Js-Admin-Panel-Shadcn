const dashboardTimeZone = "Asia/Dhaka";

export function formatDashboardOrderDateTime(value: string) {
  // Dashboard queries return MySQL timestamps in Bangladesh local time without an offset.
  const normalized = value.trim().replace(" ", "T");
  const timestamp = new Date(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized) ? normalized + "+06:00" : normalized,
  );

  if (Number.isNaN(timestamp.getTime())) {
    return { timestamp: 0, date: "Unavailable", time: "" };
  }

  return {
    timestamp: timestamp.getTime(),
    date: timestamp.toLocaleDateString("en-US", {
      timeZone: dashboardTimeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: timestamp.toLocaleTimeString("en-US", {
      timeZone: dashboardTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}
