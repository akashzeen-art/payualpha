/**
 * Payment API Service (legacy HTML form submit).
 * UPI Intent + JSON flow: use `initiatePayment` from `@/services/upiPaymentService`.
 */

import { getPaymentInitiateUrl } from "@/config/config";

export const initiatePayment = (orderData: any) => {
  const { portalId, clickId, mobile, packType, price } = orderData;

  const apiUrl = getPaymentInitiateUrl();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = apiUrl;

  const payload = {
    portalId: parseInt(portalId),
    mobile: mobile,
    email: '',
    clickId: clickId,
    servicePack: packType,
    amount: parseFloat(price)
  };

  Object.keys(payload).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = (payload as any)[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

export const getPackTypeFromPlan = (selectedPlan: string) => {
  switch (selectedPlan.toLowerCase()) {
    case 'weekly':
      return 'WEEKLY';
    case 'monthly':
      return 'MONTHLY';
    default:
      return 'MONTHLY';
  }
};

export const getPriceForPlan = (pricingData: any, selectedPlan: string) => {
  if (!pricingData || !pricingData.plans) {
    return 0;
  }
  
  const plan = pricingData.plans[selectedPlan.toLowerCase()];
  return plan ? plan.discountedPrice : 0;
};

/** Re-export: JSON / UPI Intent initiate (form POST + session flow). */
export { initiatePayment as initiatePaymentIntent } from "./upiPaymentService";
