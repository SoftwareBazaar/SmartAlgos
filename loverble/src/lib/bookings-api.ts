function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
}

const API_BASE = resolveApiBase();

export type BookConsultationInput = {
  service: string;
  consultation_type: "free_20" | "paid_90";
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type BookingResult = {
  success: boolean;
  reference?: string;
  message?: string;
  error?: string;
  meetingLink?: string;
  emailsSent?: boolean;
  savedToDb?: boolean;
};

export async function fetchAvailableSlots(date: string, consultationType: "free_20" | "paid_90") {
  const params = new URLSearchParams({ date, consultation_type: consultationType });
  const res = await fetch(`${API_BASE}/api/bookings/available-slots?${params}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Could not load time slots");
  return data as { slots: { time: string; available: boolean }[] };
}

export async function bookFreeConsultation(input: BookConsultationInput): Promise<BookingResult> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Booking failed");
  }
  return data as BookingResult;
}

export async function reservePaidConsultation(input: BookConsultationInput): Promise<BookingResult> {
  const res = await fetch(`${API_BASE}/api/bookings/pending-paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Could not reserve session");
  }
  return data as BookingResult;
}
