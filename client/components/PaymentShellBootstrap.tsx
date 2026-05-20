import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PAYMENT_SESSION_KEYS } from "@/utils/paymentSession";
import {
  redirectToCheckoutAfterFailure,
  shouldAbortProcessingFromUrl,
} from "@/utils/paymentRedirects";

/**
 * Global payment UX: abort processing on failure signals; resume processing after UPI return.
 */
export default function PaymentShellBootstrap() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/payment/processing") return;
    if (shouldAbortProcessingFromUrl(location.search)) {
      redirectToCheckoutAfterFailure();
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (location.pathname.startsWith("/payment/processing")) return;
      const txn = sessionStorage.getItem(PAYMENT_SESSION_KEYS.UPI_RETURN_TXN);
      if (!txn) return;
      navigate(`/payment/processing?txnId=${encodeURIComponent(txn)}`, { replace: true });
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [location.pathname, navigate]);

  return null;
}
