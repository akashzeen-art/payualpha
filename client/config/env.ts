/**
 * API base for payment and subscription calls.
 * In dev, empty string = same-origin so Vite can proxy `/api/*`.
 * Set `VITE_API_BASE_URL` to override (e.g. full https://eyoga.live).
 */
const DEFAULT_PRODUCTION_API = "https://eyoga.live";

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim().replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return DEFAULT_PRODUCTION_API;
}
