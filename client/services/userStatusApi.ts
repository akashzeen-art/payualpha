/**
 * User Status API Service
 */

import { getApiBaseUrl } from "@/config/env";

export const checkUserStatus = async (mobile: string, portalId: string | number) => {
  if (!mobile || mobile === '' || mobile === 'undefined' || mobile === 'null') {
    console.error('❌ CRITICAL: Status API called with invalid mobile:', mobile);
    throw new Error('Invalid mobile number');
  }
  
  const apiUrl = `${getApiBaseUrl()}/api/user/status?mobile=${mobile}&id=${portalId}`;
  
  console.log('🔍 Status API Request:', { mobile, portalId, url: apiUrl });
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    console.error('❌ Status API failed:', response.status);
    throw new Error(`Status check failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Status API Response:', data);
  
  return data;
};

export const isUserSubscribed = (statusData: any) => {
  return statusData && statusData.active === true;
};

export const getSubscriptionDetails = (statusData: any) => {
  if (!statusData) return null;
  
  return {
    portalName: statusData.portalName,
    mobile: statusData.mobile,
    packType: statusData.packType,
    startDate: statusData.startDate,
    endDate: statusData.endDate,
    active: statusData.active
  };
};
