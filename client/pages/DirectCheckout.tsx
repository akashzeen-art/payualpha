import { useState, useEffect, useRef } from "react";
import { getPortalIdFromUrl, getClickIdFromUrl, isValidClickId } from "../utils/clickIdManager";
import PaymentButton from "@/components/payment/PaymentButton";
import { API_CONFIG } from "@/config/config";
import { resolvePackPrice } from "@/utils/pricingUtils";
import { isCheckoutPaymentFailedQuery } from "@/utils/paymentRedirects";
import { PAYMENT_SESSION_KEYS } from "@/utils/paymentSession";

export default function DirectCheckout() {
  const [formData, setFormData] = useState({ mobile: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentFailedBanner, setPaymentFailedBanner] = useState("");
  const [urlParams, setUrlParams] = useState({ clickid: "", id: "" });
  const [price, setPrice] = useState<number | null>(null);
  const [servicePack, setServicePack] = useState<string | null>(null);
  const [portalId, setPortalId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string>("/bgcheckout.png");
  const configFetched = useRef(false);

  useEffect(() => {
    if (configFetched.current) return;

    const id = getPortalIdFromUrl() || "1";
    const clickid = getClickIdFromUrl() || "";

    setUrlParams({ clickid, id });

    configFetched.current = true;
    fetchPaymentConfig(clickid, id);
  }, []);

  useEffect(() => {
    if (!isCheckoutPaymentFailedQuery(window.location.search)) {
      return;
    }
    setPaymentFailedBanner("Payment failed. Please try again.");
    const storedMobile = sessionStorage.getItem(PAYMENT_SESSION_KEYS.MOBILE);
    if (storedMobile) {
      setFormData((prev) => ({ ...prev, mobile: storedMobile }));
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
  }, []);

  const resolvePriceFromAPI = (apiResponse: Parameters<typeof resolvePackPrice>[0]) =>
    resolvePackPrice(apiResponse);

  const fetchPaymentConfig = async (clickid: string, planId: string) => {
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}/api/payment/portal/${planId}?clickid=${clickid}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const config = await response.json();
      const resolved = resolvePriceFromAPI(config);
      
      setBanner(config.banner || "/bgcheckout.png");
      if (resolved) {
        setPrice(resolved.price);
        setServicePack(resolved.packType);
        setPortalId(config.portalId || planId);
      } else {
        setPrice(null);
        setServicePack(null);
        setPortalId(config.portalId || planId);
      }
      
      setLoading(false);
    } catch (err) {
      setPrice(null);
      setServicePack(null);
      setPortalId(planId);
      setBanner("/bgcheckout.png");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateBeforePayment = async (): Promise<boolean> => {
    setError("");

    if (price === null) {
      setError("Price information is not available. Please try again later.");
      return false;
    }

    if (formData.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    try {
      const statusApiUrl = `${API_CONFIG.BASE_URL}/api/user/status?mobile=${formData.mobile}&id=${portalId || urlParams.id || "1"}`;
      const statusResponse = await fetch(statusApiUrl);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();

        if (statusData.active === true) {
          window.location.href = `/?msisdn=${formData.mobile}&id=${portalId || urlParams.id || "1"}`;
          return false;
        }
      }
    } catch (error) {
      console.error("Status check failed:", error);
    }

    if (!isValidClickId(urlParams.clickid)) {
      setError("Unable To Subscribe.");
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-black">
        <div className="absolute inset-0" style={{ backgroundImage: `url('${banner}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black">
      <div className="absolute inset-0" style={{ backgroundImage: `url('${banner}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-5xl font-bold text-white text-center mb-2">गरमा गरम !</h2>
          <p className="text-2xl font-medium text-red-300 text-center mb-6">Webseries</p>
          
          <div className="text-center mb-6">
            <img 
              src="/logo.png" 
              alt="Product" 
              className="max-w-[50%] h-auto mx-auto rounded-lg shadow-lg"
            />
          </div>
          
              {paymentFailedBanner && (
                <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-center text-sm font-semibold text-red-200">
                  {paymentFailedBanner}
                </div>
              )}
              <div className="border border-red-400/30 rounded-lg p-4 mb-6">
            <p className="text-white text-center">
              <strong className="text-red-300"></strong> Proceed further to complete the payment of{" "}
              {price !== null && servicePack ? (
                <strong className="text-red-300">Rs.{price} ({servicePack})</strong>
              ) : (
                <strong className="text-gray-400">Loading...</strong>
              )} for your order.
            </p>
            <p className="text-white/80 text-center text-sm mt-3">
              Already Subscribed? <br />Login With Your Mobile Number.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Mobile Number</label>
              <div className="flex bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                <span className="px-4 py-3 text-white border-r border-white/20 select-none flex items-center justify-center whitespace-nowrap">+91</span>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  required
                  className="w-full px-3 py-3 bg-transparent text-white placeholder-white/100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > 10) {
                      target.value = target.value.slice(0, 10);
                    }
                  }}
                />
              </div>
              {error && <div className="text-red-500 text-sm font-bold text-center mt-2">{error}</div>}
            </div>

            <PaymentButton
              mobile={formData.mobile}
              portalId={portalId || urlParams.id || "1"}
              clickId={urlParams.clickid}
              planId={servicePack || "DAILY"}
              amount={price ?? 0}
              disabled={loading || price === null}
              onBeforePayment={validateBeforePayment}
            >
              Complete Order
            </PaymentButton>
          </form>
        </div>
      </div>
    </div>
  );
}
