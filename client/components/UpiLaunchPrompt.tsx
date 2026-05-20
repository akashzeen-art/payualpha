import { useCallback } from "react";
import { setUpiOpened, setUpiReturnTxn } from "@/utils/paymentSession";

export interface UpiLaunchPromptProps {
  intentUrl: string;
  txnId: string;
  onContinue: () => void;
}

/**
 * Native anchor so UPI opens from a real user gesture (reliable on mobile).
 */
export default function UpiLaunchPrompt({ intentUrl, txnId, onContinue }: UpiLaunchPromptProps) {
  const onUpiAnchorClick = useCallback(() => {
    setUpiReturnTxn(txnId);
    setUpiOpened();
  }, [txnId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-900 p-6 text-center shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Complete payment in UPI</h2>
        <p className="text-white/70 text-sm mb-6">
          Tap below to open your UPI app. After paying (or if you cancel), return here and tap
          &quot;Continue&quot; to verify.
        </p>

        <a
          href={intentUrl}
          onClick={onUpiAnchorClick}
          className="mb-4 flex w-full items-center justify-center rounded-lg bg-red-600 py-3 text-lg font-bold text-white hover:bg-red-700"
        >
          Open UPI app
        </a>

        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg border border-white/30 py-3 font-semibold text-white hover:bg-white/10"
        >
          Continue to verify payment
        </button>
      </div>
    </div>
  );
}
