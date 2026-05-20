import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { initializeClickId, getMsisdnFromUrl } from "./utils/clickIdManager";
import { handlePostPaymentFlow } from "./utils/postPaymentHandler";
import { useEffect } from "react";
import Index from "./pages/Index";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Account from "./pages/Account";
import DirectCheckout from "./pages/DirectCheckout";
import PaymentProcessing from "./pages/PaymentProcessing";
import PaymentShellBootstrap from "./components/PaymentShellBootstrap";

const queryClient = new QueryClient();

function AppContent() {
  useEffect(() => {
    const { clickId, portalId } = initializeClickId();
    const msisdn = getMsisdnFromUrl();

    if (msisdn && portalId) {
      console.log("💳 Post-payment flow detected:", { msisdn, portalId });
      handlePostPaymentFlow(msisdn, portalId).then(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has("msisdn")) {
          url.search = "";
          if (clickId) url.searchParams.set("clickid", clickId);
          if (portalId) url.searchParams.set("id", portalId);
          window.history.replaceState({}, "", url.toString());
        }
      });
    } else {
      const storedMobile = localStorage.getItem("userMobile");
      if (storedMobile && portalId) {
        console.log("🔄 Checking existing subscription:", { mobile: storedMobile, portalId });
        handlePostPaymentFlow(storedMobile, portalId);
      }
    }

    localStorage.removeItem(`eatme_product_cache_${portalId}`);
    document.title = "EYoga";
  }, []);

  return (
    <>
      <PaymentShellBootstrap />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/checkout" element={<DirectCheckout />} />
        <Route path="/payment/processing" element={<PaymentProcessing />} />
        <Route path="/payment-processing" element={<Navigate to="/payment/processing" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Index />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SubscriptionProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </BrowserRouter>
        </SubscriptionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
