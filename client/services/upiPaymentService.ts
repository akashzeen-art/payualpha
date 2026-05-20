/**
 * UPI / PayU-style payment initiation and status polling.
 */

import { getPaymentInitiateUrl, getPaymentStatusUrl } from "@/config/config";

export interface InitiatePaymentPayload {
  mobile: string;
  portalId: string | number;
  clickId: string;
  planId: string;
  amount: number;
  email?: string;
}

export interface InitiatePaymentResponse {
  intentUrl: string;
  processingUrl: string;
  successurl: string;
  status: string;
  txnId: string;
}

export interface LegacyHtmlPaymentResponse {
  type: "html";
  html: string;
}

export type InitiatePaymentResult = InitiatePaymentResponse | LegacyHtmlPaymentResponse;

export interface PaymentStatusResponse {
  status: string;
  txnId?: string;
  message?: string;
  [key: string]: unknown;
}

const parseInitiateResponse = (data: Record<string, unknown>): InitiatePaymentResponse => {
  const intentUrl = data.intentUrl as string | undefined;
  const processingUrl = data.processingUrl as string | undefined;
  const successurl = (data.successurl ?? data.successUrl) as string | undefined;
  const txnId = (data.txnId ?? data.txid) as string | undefined;
  const status = (data.status as string) ?? "INITIATED";

  if (!intentUrl || !processingUrl || !successurl || !txnId) {
    throw new Error("Invalid payment initiation response from server");
  }

  return {
    intentUrl,
    processingUrl,
    successurl,
    status,
    txnId,
  };
};

const buildFormBody = (payload: InitiatePaymentPayload): URLSearchParams => {
  const formBody = new URLSearchParams();
  formBody.set("portalId", String(parseInt(String(payload.portalId), 10)));
  formBody.set("mobile", payload.mobile);
  formBody.set("email", payload.email ?? "");
  formBody.set("clickId", payload.clickId);
  formBody.set("servicePack", payload.planId);
  formBody.set("amount", String(payload.amount));
  return formBody;
};

const isSpringErrorPayload = (data: Record<string, unknown>): boolean =>
  typeof data.status === "number" && data.status >= 400;

/**
 * POST initiate as application/x-www-form-urlencoded; expect JSON for UPI Intent flow.
 */
export const initiatePayment = async (
  payload: InitiatePaymentPayload
): Promise<InitiatePaymentResult> => {
  const response = await fetch(getPaymentInitiateUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: buildFormBody(payload).toString(),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();

  if (!response.ok) {
    if (responseText.includes("<html") || responseText.includes("<form")) {
      throw new Error("Payment initiation rejected by gateway (HTML error page).");
    }
    try {
      const err = JSON.parse(responseText) as Record<string, unknown>;
      throw new Error(
        (err.message as string) ||
          (err.error as string) ||
          `Payment initiation failed (${response.status})`
      );
    } catch (e) {
      if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
    }
    throw new Error(responseText || `Payment initiation failed with status ${response.status}`);
  }

  const trimmed = responseText.trim();

  if (contentType.includes("application/json") || trimmed.startsWith("{")) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid JSON response from payment server");
    }

    if (isSpringErrorPayload(data)) {
      throw new Error(
        (data.message as string) ||
          (data.error as string) ||
          `Payment initiation failed (${data.status})`
      );
    }

    return parseInitiateResponse(data);
  }

  if (trimmed.includes("<form") || trimmed.includes("<html")) {
    return { type: "html", html: responseText };
  }

  throw new Error("Unexpected payment gateway response");
};

const findGatewayForm = (html: string): HTMLFormElement | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const byId = doc.getElementById("airpayForm");
  if (byId instanceof HTMLFormElement) {
    return byId;
  }

  const firstForm = doc.querySelector("form");
  return firstForm instanceof HTMLFormElement ? firstForm : null;
};

const cloneGatewayForm = (sourceForm: HTMLFormElement): HTMLFormElement => {
  const form = document.createElement("form");
  form.method = sourceForm.method || "post";
  form.action = sourceForm.action;
  form.style.display = "none";

  sourceForm.querySelectorAll("input, select, textarea").forEach((field) => {
    const name =
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
        ? field.name
        : "";

    if (!name) return;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value =
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
        ? field.value
        : "";
    form.appendChild(input);
  });

  return form;
};

export const submitLegacyPaymentHtml = (html: string): void => {
  const sourceForm = findGatewayForm(html);

  if (sourceForm) {
    const form = cloneGatewayForm(sourceForm);
    document.body.appendChild(form);
    form.submit();
    return;
  }

  if (html.includes("<html") || html.includes("<form")) {
    document.open();
    document.write(html);
    document.close();
    return;
  }

  throw new Error("Payment form not found in gateway response");
};

export const isUpiIntentResponse = (
  result: InitiatePaymentResult
): result is InitiatePaymentResponse => !("type" in result);

/** Map server text / JSON to coarse status for polling. */
export function interpretProcessingBody(body: string, isFirstPoll: boolean): "success" | "failure" | "pending" {
  const trimmed = body.trim();
  let token = trimmed;

  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed) as Record<string, unknown>;
      token = String(j.status ?? j.state ?? j.paymentStatus ?? j.data ?? "");
    } catch {
      token = trimmed;
    }
  }

  const u = token.toUpperCase();

  if (["SUCCESS", "ACTIVE", "COMPLETED", "PAID"].includes(u)) {
    return "success";
  }
  if (["FAILED", "FAIL", "CANCELLED", "CANCELED", "DECLINED", "ERROR"].includes(u)) {
    return "failure";
  }
  if (u === "INACTIVE" || u === "NOT_PAID" || u === "UNPAID") {
    return isFirstPoll ? "pending" : "failure";
  }
  return "pending";
}

export async function fetchProcessingStatusRaw(
  processingUrl: string
): Promise<{ ok: boolean; text: string }> {
  try {
    const response = await fetch(processingUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    const text = (await response.text()).trim();
    return { ok: response.ok, text };
  } catch {
    return { ok: false, text: "NETWORK_ERROR" };
  }
}

export const checkPaymentStatus = async (
  processingUrlOrTxnId: string,
  options?: { useTxnIdOnly?: boolean }
): Promise<PaymentStatusResponse> => {
  const url = options?.useTxnIdOnly
    ? getPaymentStatusUrl(processingUrlOrTxnId)
    : processingUrlOrTxnId;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Payment status check failed with status ${response.status}`);
  }

  const text = (await response.text()).trim();
  try {
    return JSON.parse(text) as PaymentStatusResponse;
  } catch {
    return { status: text };
  }
};
