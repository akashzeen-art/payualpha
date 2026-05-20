/**
 * Pricing API Service
 */

import { API_CONFIG } from "@/config/config";
import { parseMultiplePackType } from "@/utils/pricingUtils";

export const fetchPricingData = async (portalId: string | number, clickId: string) => {
  const apiUrl = `${API_CONFIG.BASE_URL}/api/payment/portal/${portalId}?clickid=${clickId}`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

export const parsePricingForUI = (apiData: any) => {
  const multiplePackType = parseMultiplePackType(apiData);

  const plans: any = {};

  if (multiplePackType?.WEEKLY) {
    const weeklyPrice = parseInt(String(multiplePackType.WEEKLY), 10);
    plans.weekly = {
      discountedPrice: weeklyPrice,
      originalPrice: calculateOriginalPrice(weeklyPrice, "weekly"),
      discount: calculateDiscount(
        weeklyPrice,
        calculateOriginalPrice(weeklyPrice, "weekly")
      ),
    };
  }

  if (multiplePackType?.MONTHLY) {
    const monthlyPrice = parseInt(String(multiplePackType.MONTHLY), 10);
    plans.monthly = {
      discountedPrice: monthlyPrice,
      originalPrice: calculateOriginalPrice(monthlyPrice, "monthly"),
      discount: calculateDiscount(
        monthlyPrice,
        calculateOriginalPrice(monthlyPrice, "monthly")
      ),
    };
  }

  if (multiplePackType?.QUARTERLY) {
    const quarterlyPrice = parseInt(String(multiplePackType.QUARTERLY), 10);
    plans.quarterly = {
      discountedPrice: quarterlyPrice,
      originalPrice: calculateOriginalPrice(quarterlyPrice, "quarterly"),
      discount: calculateDiscount(
        quarterlyPrice,
        calculateOriginalPrice(quarterlyPrice, "quarterly")
      ),
    };
  }
  
  return {
    portalId: apiData.portalId,
    currencyCode: apiData.currencyCode || 'INR',
    plans
  };
};

const calculateOriginalPrice = (discountedPrice: number, planType: string) => {
  const discountRate = 0.5;
  return Math.round(discountedPrice / (1 - discountRate));
};

const calculateDiscount = (discountedPrice: number, originalPrice: number) => {
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return `${discount}% OFF`;
};
