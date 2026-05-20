import { PAYMENT_SESSION_KEYS, stripSensitivePaymentKeys } from "@/utils/paymentSession";

/**
 * Full-page redirect to checkout after payment failure / cancel.
 * Returns the path (for optional <Navigate replace />).
 */
export function redirectToCheckoutAfterFailure(): string {
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.PAYMENT_FAILED, "1");

  const portalId =
    sessionStorage.getItem(PAYMENT_SESSION_KEYS.PORTAL_ID) || "1";
  const clickId = sessionStorage.getItem(PAYMENT_SESSION_KEYS.CLICK_ID) || "";

  stripSensitivePaymentKeys();

  const params = new URLSearchParams();
  params.set("id", portalId);
  if (clickId) params.set("clickid", clickId);
  params.set("payment", "failed");

  const path = `/checkout?${params.toString()}`;
  window.location.replace(`${window.location.origin}${path}`);
  return path;
}

export function isCheckoutPaymentFailedQuery(search: string): boolean {
  const sp = new URLSearchParams(search);
  return sp.get("payment") === "failed";
}

export function normalizeSuccessUrl(successurl: string): string {
  const s = successurl.trim();
  if (!s) return "/";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `${window.location.protocol}${s}`;
  if (s.startsWith("/")) return `${window.location.origin}${s}`;
  return `https://${s}`;
}

export function shouldAbortProcessingFromUrl(search: string): boolean {
  const sp = new URLSearchParams(search);
  if (sp.get("payment") === "failed") return true;
  return sessionStorage.getItem(PAYMENT_SESSION_KEYS.PAYMENT_FAILED) === "1";
}
