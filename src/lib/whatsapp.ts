/** Kthen numrin shqiptar (p.sh. "068 200 2586") në link wa.me me prefiks +355. */
export function whatsappHref(phone: string, message?: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `355${digits.slice(1)}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
