/**
 * Access Control Guard
 */

import { checkUserStatus, isUserSubscribed } from '../services/userStatusApi';

export const verifyAccessWithAPI = async (mobile: string, portalId: string | number) => {
  if (!mobile || mobile.trim() === '' || mobile === 'undefined' || mobile === 'null') {
    console.error('❌ BLOCKED: Status API call with invalid mobile:', mobile);
    return false;
  }
  
  if (!portalId) {
    console.error('❌ BLOCKED: Missing portalId');
    return false;
  }

  try {
    console.log('🔍 Verifying access via Status API:', { mobile, portalId });
    const statusData = await checkUserStatus(mobile, portalId);
    const isActive = isUserSubscribed(statusData);
    
    console.log('📊 API Response:', { active: statusData?.active, isActive });
    
    if (isActive) {
      console.log('✅ Access granted: User is active subscriber');
      return true;
    } else {
      console.log('❌ Access denied: User subscription not active');
      return false;
    }
  } catch (error) {
    console.error('❌ Access denied: API verification failed', error);
    return false;
  }
};

export const clearSubscriptionCache = () => {
  localStorage.removeItem('isSubscribed');
  localStorage.removeItem('subscriptionData');
  console.log('🧹 Subscription cache cleared');
};

export const getMobileForVerification = () => {
  console.log('🔎 Searching for mobile number...');
  
  const urlParams = new URLSearchParams(window.location.search);
  const msisdn = urlParams.get('msisdn');
  
  if (msisdn && msisdn.trim() !== '' && msisdn !== 'undefined' && msisdn !== 'null') {
    const cleanMobile = msisdn.trim();
    console.log('✅ Mobile from URL:', cleanMobile);
    localStorage.setItem('userMobile', cleanMobile);
    return cleanMobile;
  }
  
  const storedMobile = localStorage.getItem('userMobile');
  if (storedMobile && storedMobile.trim() !== '' && storedMobile !== 'undefined' && storedMobile !== 'null') {
    const cleanMobile = storedMobile.trim();
    console.log('✅ Mobile from storage:', cleanMobile);
    return cleanMobile;
  }
  
  console.error('❌ CRITICAL: No valid mobile number found in URL or storage');
  return null;
};

export const getPortalIdForVerification = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
};

export const normalizeUrlWithMobile = (mobile: string, portalId: string | number = '1') => {
  if (!mobile || mobile.trim() === '') {
    console.error('❌ Cannot normalize URL: Invalid mobile');
    return;
  }
  
  const cleanMobile = mobile.trim();
  const currentUrl = new URL(window.location.href);
  
  currentUrl.searchParams.set('msisdn', cleanMobile);
  currentUrl.searchParams.set('id', portalId.toString());
  currentUrl.searchParams.delete('clickid');
  
  console.log('🔄 Normalizing URL with mobile:', cleanMobile);
  
  window.history.replaceState({}, '', currentUrl.toString());
  localStorage.setItem('userMobile', cleanMobile);
};
