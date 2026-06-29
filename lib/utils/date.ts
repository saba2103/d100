/**
 * Returns today's date string in YYYY-MM-DD format aligned with the Asia/Kolkata (IST) timezone.
 * This prevents timezone discrepancies between the server (UTC) and client (IST).
 */
export function getTodayStr(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Kolkata" });
}
