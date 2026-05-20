/**
 * Post-Payment Handler Utility
 */

import { checkUserStatus, isUserSubscribed } from '../services/userStatusApi';

export const handlePostPaymentFlow = async (msisdn: string, portalId: string | number) => {
  try {
    console.log('🔄 Checking post-payment subscription status:', { msisdn, portalId });
    
    const statusData = await checkUserStatus(msisdn, portalId);
    const isActive = isUserSubscribed(statusData);
    
    if (isActive) {
      localStorage.setItem('isSubscribed', 'true');
      localStorage.setItem('userMobile', msisdn);
      localStorage.setItem('subscriptionData', JSON.stringify(statusData));
      console.log('✅ Post-payment: User is active subscriber');
      return true;
    } else {
      localStorage.removeItem('isSubscribed');
      localStorage.removeItem('userMobile');
      localStorage.removeItem('subscriptionData');
      console.log('❌ Post-payment: User subscription not active');
      return false;
    }
  } catch (error) {
    console.error('❌ Post-payment status check failed:', error);
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('subscriptionData');
    return false;
  }
};

export const cleanPostPaymentUrl = () => {
  const url = new URL(window.location.href);
  const clickid = url.searchParams.get('clickid');
  const id = url.searchParams.get('id');
  
  if (url.searchParams.has('msisdn')) {
    url.search = '';
    
    if (clickid) url.searchParams.set('clickid', clickid);
    if (id) url.searchParams.set('id', id);
    
    window.history.replaceState({}, '', url.toString());
    console.log('🔧 URL cleaned after post-payment processing');
  }
};
