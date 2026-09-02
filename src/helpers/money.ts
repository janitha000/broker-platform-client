const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});
export function formatMoney(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "—";
  }
  return aud.format(amount);
}
