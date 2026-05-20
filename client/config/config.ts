/**
 * API path constants — base URL from `getApiBaseUrl()` (see env.ts).
 */
import { getApiBaseUrl } from "./env";

export const API_PATHS = {
  PAYMENT_INITIATE: "/api/payment/initiate",
  PAYMENT_STATUS: "/api/payment/status",
} as const;

export const getPaymentInitiateUrl = () =>
  `${getApiBaseUrl()}${API_PATHS.PAYMENT_INITIATE}`;

export const getPaymentStatusUrl = (txnId: string) =>
  `${getApiBaseUrl()}${API_PATHS.PAYMENT_STATUS}?txid=${encodeURIComponent(txnId)}`;

/** @deprecated use getApiBaseUrl() from @/config/env */
export const API_CONFIG = {
  get BASE_URL() {
    return getApiBaseUrl();
  },
};
