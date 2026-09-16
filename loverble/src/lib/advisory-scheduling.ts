/** Advisory desk — products, slots (7–9 PM EAT daily). */

export const ADVISORY_PRODUCTS = [
  { id: "equities", label: "Stocks & Equities", dbService: "stock_trading" },
  { id: "derivatives", label: "Futures & Derivatives", dbService: "algo_development" },
  { id: "forex", label: "Forex", dbService: "forex_trading" },
  { id: "commodities", label: "Commodities", dbService: "other" },
  { id: "our-strategies", label: "Our Live Strategies", dbService: "algo_development" },
  { id: "custom-systems", label: "Systems You Want to Build", dbService: "algo_development" },
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
  const match = ADVISORY_PRODUCTS.find((p) => p.id === id || p.dbService === id);
  if (match) return match.label;
  const legacy: Record<string, string> = {
    stock_trading: "Stocks & Equities",
    algo_development: "Algo / Systems",
    forex_trading: "Forex",
    web_development: "Web Development",
    other: "Other",
  };
  return legacy[id] ?? id;
}

/** Map UI product id to legacy consultation_bookings.service values */
export function serviceToDb(service: string): string {
  return ADVISORY_PRODUCTS.find((p) => p.id === service)?.dbService ?? service;
}

export function visitorTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Nairobi";
  } catch {
    return "Africa/Nairobi";
  }
}

function formatEatClock(time: string): string {
  const [h, m] = normalizeTimeSlot(time).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period} EAT`;
}

export function eatSlotToLocal(date: string, time: string, timeZone: string): string {
  const iso = `${date}T${normalizeTimeSlot(time)}:00+03:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSlotLabel(time: string, date?: string, timeZone?: string): string {
  const eat = formatEatClock(time);
  const isLastFree = normalizeTimeSlot(time) === "20:40";
  const lastNote = isLastFree ? " — last 20-min slot" : "";
  if (!date || !timeZone || timeZone === "Africa/Nairobi") return `${eat}${lastNote}`;
  const local = eatSlotToLocal(date, time, timeZone);
  return local ? `${eat} · ${local} local${lastNote}` : `${eat}${lastNote}`;
}

export function todayInEat(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function isDateBookable(date: string): boolean {
  return date >= todayInEat();
}
