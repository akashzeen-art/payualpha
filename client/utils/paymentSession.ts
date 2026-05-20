/**
 * Payment session (sessionStorage) — namespaced keys.
 */

export const PAYMENT_SESSION_KEYS = {
  TXN_ID: "eyoga:payment:txnId",
  PROCESSING_URL: "eyoga:payment:processingUrl",
  SUCCESS_URL: "eyoga:payment:successurl",
  INTENT_URL: "eyoga:payment:intentUrl",
  MOBILE: "eyoga:payment:mobile",
  PORTAL_ID: "eyoga:payment:portalId",
  CLICK_ID: "eyoga:payment:clickId",
  PLAN_ID: "eyoga:payment:planId",
  AMOUNT: "eyoga:payment:amount",
  PAYMENT_FAILED: "eyoga:payment:failed",
  UPI_RETURN_TXN: "eyoga:payment:upi_return_txn",
  UPI_OPENED: "eyoga:payment:upi_opened",
} as const;

export interface PaymentSession {
  txnId: string;
  processingUrl: string;
  successurl: string;
  intentUrl: string;
  mobile?: string;
  portalId?: string;
  clickId?: string;
  planId?: string;
  amount?: number;
}

export const clearPaymentFailedFlag = (): void => {
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.PAYMENT_FAILED);
};

export const savePaymentSession = (session: PaymentSession): void => {
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.TXN_ID, session.txnId);
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.PROCESSING_URL, session.processingUrl);
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.SUCCESS_URL, session.successurl);
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.INTENT_URL, session.intentUrl);
  if (session.mobile) sessionStorage.setItem(PAYMENT_SESSION_KEYS.MOBILE, session.mobile);
  if (session.portalId) sessionStorage.setItem(PAYMENT_SESSION_KEYS.PORTAL_ID, session.portalId);
  if (session.clickId) sessionStorage.setItem(PAYMENT_SESSION_KEYS.CLICK_ID, session.clickId);
  if (session.planId) sessionStorage.setItem(PAYMENT_SESSION_KEYS.PLAN_ID, session.planId);
  if (session.amount != null) {
    sessionStorage.setItem(PAYMENT_SESSION_KEYS.AMOUNT, String(session.amount));
  }
};

export const getPaymentSession = (): PaymentSession | null => {
  const txnId = sessionStorage.getItem(PAYMENT_SESSION_KEYS.TXN_ID);
  const processingUrl = sessionStorage.getItem(PAYMENT_SESSION_KEYS.PROCESSING_URL);
  const successurl = sessionStorage.getItem(PAYMENT_SESSION_KEYS.SUCCESS_URL);
  const intentUrl = sessionStorage.getItem(PAYMENT_SESSION_KEYS.INTENT_URL);

  if (!txnId || !processingUrl || !successurl || !intentUrl) {
    return null;
  }

  const amountRaw = sessionStorage.getItem(PAYMENT_SESSION_KEYS.AMOUNT);
  return {
    txnId,
    processingUrl,
    successurl,
    intentUrl,
    mobile: sessionStorage.getItem(PAYMENT_SESSION_KEYS.MOBILE) ?? undefined,
    portalId: sessionStorage.getItem(PAYMENT_SESSION_KEYS.PORTAL_ID) ?? undefined,
    clickId: sessionStorage.getItem(PAYMENT_SESSION_KEYS.CLICK_ID) ?? undefined,
    planId: sessionStorage.getItem(PAYMENT_SESSION_KEYS.PLAN_ID) ?? undefined,
    amount: amountRaw != null ? Number(amountRaw) : undefined,
  };
};

/** Remove txn / processing / intent / UPI flags; keep mobile, portal, click for checkout UX. */
export const stripSensitivePaymentKeys = (): void => {
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.TXN_ID);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.PROCESSING_URL);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.SUCCESS_URL);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.INTENT_URL);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.PLAN_ID);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.AMOUNT);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.UPI_RETURN_TXN);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.UPI_OPENED);
};

export const clearPaymentSession = (): void => {
  Object.values(PAYMENT_SESSION_KEYS).forEach((k) => sessionStorage.removeItem(k));
};

export const setUpiReturnTxn = (txnId: string): void => {
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.UPI_RETURN_TXN, txnId);
};

export const setUpiOpened = (): void => {
  sessionStorage.setItem(PAYMENT_SESSION_KEYS.UPI_OPENED, "1");
};

export const clearUpiFlags = (): void => {
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.UPI_RETURN_TXN);
  sessionStorage.removeItem(PAYMENT_SESSION_KEYS.UPI_OPENED);
};
