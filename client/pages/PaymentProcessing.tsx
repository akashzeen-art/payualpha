import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  fetchProcessingStatusRaw,
  interpretProcessingBody,
} from "@/services/upiPaymentService";
import { checkUserStatus, isUserSubscribed } from "@/services/userStatusApi";
import {
  clearPaymentSession,
  clearUpiFlags,
  getPaymentSession,
  PAYMENT_SESSION_KEYS,
} from "@/utils/paymentSession";
import { handlePostPaymentFlow } from "@/utils/postPaymentHandler";
import {
  normalizeSuccessUrl,
  redirectToCheckoutAfterFailure,
  shouldAbortProcessingFromUrl,
} from "@/utils/paymentRedirects";

const POLL_MS = 10_000;
const VISIBILITY_GRACE_MS = 2500;

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your payment…");
  const pollCountRef = useRef(0);
  const resolvedRef = useRef(false);
  const mountedAtRef = useRef(Date.now());
  const lastOutcomeRef = useRef<"success" | "failure" | "pending">("pending");

  const markRedirecting = () => {
    resolvedRef.current = true;
  };

  const completeSuccess = useCallback(
    async (session: NonNullable<ReturnType<typeof getPaymentSession>>) => {
      if (resolvedRef.current) return;
      markRedirecting();
      setMessage("Payment successful. Redirecting…");

      localStorage.setItem("isSubscribed", "true");
      if (session.mobile) {
        localStorage.setItem("userMobile", session.mobile);
        await handlePostPaymentFlow(session.mobile, session.portalId ?? "1");
      }

      clearUpiFlags();
      clearPaymentSession();

      window.location.replace(normalizeSuccessUrl(session.successurl));
    },
    []
  );

  const failCheckout = useCallback(() => {
    if (resolvedRef.current) return;
    markRedirecting();
    redirectToCheckoutAfterFailure();
  }, []);

  const runPoll = useCallback(async () => {
    if (resolvedRef.current) return;

    if (shouldAbortProcessingFromUrl(window.location.search)) {
      failCheckout();
      return;
    }

    const qsTxn = searchParams.get("txnId");
    const session = getPaymentSession();

    if (!session?.txnId || !session.processingUrl || !session.successurl) {
      failCheckout();
      return;
    }

    if (qsTxn && qsTxn !== session.txnId) {
      failCheckout();
      return;
    }

    const isFirstPoll = pollCountRef.current === 0;
    pollCountRef.current += 1;

    const { ok, text } = await fetchProcessingStatusRaw(session.processingUrl);
    const bodyForInterpret = ok ? text : text || "HTTP_ERROR";
    const outcome = interpretProcessingBody(bodyForInterpret, isFirstPoll && ok);

    if (!ok && (bodyForInterpret === "NETWORK_ERROR" || !text)) {
      lastOutcomeRef.current = pollCountRef.current > 1 ? "failure" : "pending";
      if (pollCountRef.current > 1) {
        failCheckout();
      }
      return;
    }

    if (!ok) {
      lastOutcomeRef.current = isFirstPoll ? "pending" : "failure";
      if (!isFirstPoll) {
        failCheckout();
      }
      return;
    }

    lastOutcomeRef.current = outcome;

    if (outcome === "success") {
      await completeSuccess(session);
      return;
    }

    if (outcome === "failure") {
      failCheckout();
      return;
    }

    if (session.mobile) {
      try {
        const user = await checkUserStatus(session.mobile, session.portalId ?? "1");
        if (isUserSubscribed(user)) {
          await completeSuccess(session);
          return;
        }
      } catch {
        /* keep polling */
      }
    }

    if (!isFirstPoll && outcome === "pending") {
      failCheckout();
    }
  }, [searchParams, completeSuccess, failCheckout]);

  useEffect(() => {
    if (shouldAbortProcessingFromUrl(window.location.search)) {
      failCheckout();
      return;
    }
    void runPoll();
    const id = window.setInterval(() => void runPoll(), POLL_MS);
    return () => window.clearInterval(id);
  }, [runPoll, failCheckout]);

  useEffect(() => {
    const onVisibility = () => {
      if (resolvedRef.current) return;
      if (document.visibilityState !== "visible") return;
      if (Date.now() - mountedAtRef.current < VISIBILITY_GRACE_MS) return;

      const opened = sessionStorage.getItem(PAYMENT_SESSION_KEYS.UPI_OPENED) === "1";
      if (opened && lastOutcomeRef.current === "pending") {
        markRedirecting();
        redirectToCheckoutAfterFailure();
      }
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) onVisibility();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yoga-cream via-black to-yoga-brown px-4">
      <Loader2 className="h-14 w-14 animate-spin text-red-500 mb-4" />
      <p className="text-white text-center text-lg font-medium">{message}</p>
      <p className="text-white/60 text-sm mt-2 text-center max-w-sm">
        Do not close this tab. If you left the UPI app without paying, you may be sent back to checkout.
      </p>
    </div>
  );
}
