import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  initiatePayment,
  isUpiIntentResponse,
  submitLegacyPaymentHtml,
  type InitiatePaymentPayload,
} from "@/services/upiPaymentService";
import { clearPaymentFailedFlag, savePaymentSession } from "@/utils/paymentSession";
import UpiLaunchPrompt from "@/components/UpiLaunchPrompt";
import { cn } from "@/lib/utils";

export interface PaymentButtonProps extends InitiatePaymentPayload {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onBeforePayment?: () => Promise<boolean> | boolean;
  onPaymentInitiated?: () => void;
}

export default function PaymentButton({
  mobile,
  portalId,
  clickId,
  planId,
  amount,
  email,
  disabled = false,
  className,
  children = "Pay Now",
  onBeforePayment,
  onPaymentInitiated,
}: PaymentButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [launch, setLaunch] = useState<{ intentUrl: string; txnId: string } | null>(null);

  const handleClick = async () => {
    if (disabled || loading || launch) return;

    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!clickId) {
      toast.error("Unable to subscribe. Missing tracking information.");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount. Please try again.");
      return;
    }

    try {
      if (onBeforePayment) {
        const canProceed = await onBeforePayment();
        if (!canProceed) return;
      }

      setLoading(true);

      const result = await initiatePayment({
        mobile,
        portalId,
        clickId,
        planId,
        amount,
        email,
      });

      localStorage.setItem("userMobile", mobile);

      if (!isUpiIntentResponse(result)) {
        submitLegacyPaymentHtml(result.html);
        onPaymentInitiated?.();
        setLoading(false);
        return;
      }

      clearPaymentFailedFlag();
      savePaymentSession({
        txnId: result.txnId,
        processingUrl: result.processingUrl,
        successurl: result.successurl,
        intentUrl: result.intentUrl,
        mobile,
        portalId: String(portalId),
        clickId,
        planId,
        amount,
      });

      setLaunch({ intentUrl: result.intentUrl, txnId: result.txnId });
      setLoading(false);
      onPaymentInitiated?.();
    } catch (error) {
      console.error("UPI payment initiation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initiate payment. Please try again."
      );
      setLoading(false);
    }
  };

  const onContinueToProcessing = () => {
    if (!launch) return;
    navigate(`/payment/processing?txnId=${encodeURIComponent(launch.txnId)}`, {
      replace: true,
    });
    setLaunch(null);
  };

  return (
    <>
      {launch && (
        <UpiLaunchPrompt
          intentUrl={launch.intentUrl}
          txnId={launch.txnId}
          onContinue={onContinueToProcessing}
        />
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading || !!launch}
        className={cn(
          "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
          className
        )}
      >
        {loading ? "Processing..." : children}
      </button>
    </>
  );
}
