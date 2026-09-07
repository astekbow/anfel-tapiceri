export function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `${new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(price)} Lekë`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
