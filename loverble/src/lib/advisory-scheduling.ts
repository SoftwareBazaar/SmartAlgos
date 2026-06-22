/** Advisory desk — products, slots (7–9 PM EAT daily). */

export const ADVISORY_PRODUCTS = [
  { id: "equities", label: "Stocks & Equities" },
  { id: "derivatives", label: "Futures & Derivatives" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "our-strategies", label: "Our Live Strategies" },
  { id: "custom-systems", label: "Systems You Want to Build" },
] as const;

export type AdvisoryProductId = (typeof ADVISORY_PRODUCTS)[number]["id"];
export type ConsultationType = "free_20" | "paid_90";

export const WINDOW_START = 19 * 60; // 7:00 PM
export const WINDOW_END = 21 * 60; // 9:00 PM

export function consultationDurationMinutes(type: ConsultationType): number {
  return type === "paid_90" ? 90 : 20;
}

export function slotsForType(type: ConsultationType): string[] {
  const step = type === "paid_90" ? 90 : 20;
  const slots: string[] = [];
  for (let m = WINDOW_START; m + step <= WINDOW_END; m += step === 90 ? 90 : 20) {
    slots.push(formatMinutes(m));
  }
  return slots;
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTimeSlot(time);
  const [h, m] = normalized.split(":").map(Number);
  return h * 60 + m;
}

/** HH:MM from API/UI or HH:MM:SS from Postgres TIME columns */
export function normalizeTimeSlot(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

export function normalizeTimeForDb(time: string): string {
  const slot = normalizeTimeSlot(time);
  return slot.length === 5 ? `${slot}:00` : slot;
}

/** DB stores legacy free_30 for the 20-minute intro session */
export function consultationTypeToDb(type: ConsultationType): string {
  return type === "free_20" ? "free_30" : type;
}

export function consultationTypeFromDb(dbType: string): ConsultationType {
  if (dbType === "paid_90") return "paid_90";
  return "free_20";
}

export function bookingRange(time: string, type: ConsultationType): [number, number] {
  const start = parseTimeToMinutes(time);
  return [start, start + consultationDurationMinutes(type)];
}

export function rangesOverlap(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

export function productLabel(id: string): string {
  return ADVISORY_PRODUCTS.find((p) => p.id === id)?.label ?? id;
}

export function formatSlotLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period} EAT`;
}

export function todayInEat(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function isDateBookable(date: string): boolean {
  return date >= todayInEat();
}
