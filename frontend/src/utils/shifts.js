/** Each shift is stored once in the DB; overnight carry-ins are UI-only duplicates. */
export function uniqueShifts(shifts) {
  return shifts.filter((s) => !s._overnight);
}

export function sumHours(shifts) {
  return uniqueShifts(shifts).reduce((total, s) => total + s.hours, 0);
}

/** e.g. 14.25 → "14h 15m", 6 → "6h", 0.5 → "30m" */
export function formatHours(hours) {
  const totalMinutes = Math.round(Number(hours) * 60);
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0h";

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
