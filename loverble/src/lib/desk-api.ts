export async function sendDeskMessage(input: {
  name: string;
  email: string;
  company?: string;
  topic?: string;
  message: string;
  source?: string;
}) {
  const res = await fetch("/api/desk/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Could not send the message");
  }
  return data;
}
