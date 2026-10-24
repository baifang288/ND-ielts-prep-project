/** Local-date helpers. Dates are stored as YYYY-MM-DD strings in the learner's local time. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseISODate(b).getTime() - parseISODate(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISODate(s);
  return toISODate(d) === s;
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/** e.g. "จ. 9 พ.ย. 2026" (Gregorian year, matching the exam calendar). */
export function formatThaiDate(iso: string, withDay = true): string {
  const d = parseISODate(iso);
  const base = `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return withDay ? `${TH_DAYS[d.getDay()]} ${base}` : base;
}

export function formatMonthYear(iso: string): string {
  const d = parseISODate(iso);
  return `${TH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Monday-based start of week for an ISO date. */
export function startOfWeek(iso: string): string {
  const d = parseISODate(iso);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

export function formatMinutes(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} นาที`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} ชม. ${r} นาที` : `${h} ชม.`;
}
