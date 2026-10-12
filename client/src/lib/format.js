export function money(value, currency = "PKR") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  if (n >= 10_000_000) return `${currency} ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `${currency} ${(n / 100_000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function moneyFull(value, currency = "PKR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function when(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function day(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function statusTone(status) {
  const map = {
    new: "bg-ink-900/10 text-ink-800",
    contacted: "bg-brass-200 text-ink-800",
    qualified: "bg-sage-100 text-sage-500",
    viewing: "bg-clay-100 text-clay-600",
    negotiation: "bg-clay-100 text-clay-600",
    won: "bg-sage-100 text-sage-500",
    lost: "bg-paper-200 text-ink-500",
    available: "bg-sage-100 text-sage-500",
    reserved: "bg-brass-200 text-ink-800",
    sold: "bg-ink-900 text-paper-50",
    rented: "bg-ink-800 text-paper-50",
    draft: "bg-paper-200 text-ink-500",
    inquiry: "bg-paper-200 text-ink-700",
    offer: "bg-clay-100 text-clay-600",
    token: "bg-brass-200 text-ink-800",
    contract: "bg-sage-100 text-sage-500",
    closed: "bg-ink-900 text-paper-50",
    scheduled: "bg-sage-100 text-sage-500",
    completed: "bg-ink-900/10 text-ink-800",
    cancelled: "bg-paper-200 text-ink-500",
    "no-show": "bg-clay-100 text-clay-600",
    pending: "bg-brass-200 text-ink-800",
    approved: "bg-sage-100 text-sage-500",
    paid: "bg-ink-900 text-paper-50",
    open: "bg-clay-100 text-clay-600",
    done: "bg-sage-100 text-sage-500",
    missed: "bg-paper-200 text-ink-500",
    active: "bg-sage-100 text-sage-500",
    inactive: "bg-paper-200 text-ink-500",
  };
  return map[status] || "bg-paper-200 text-ink-700";
}
