/**
 * Login Success Handler
 */

import { checkUserStatus, isUserSubscribed } from '../services/userStatusApi';

export const handleLoginSuccess = async (mobile: string, portalId: string | number = '1') => {
  if (!mobile || mobile.trim() === '') {
    console.error('❌ Login success: Invalid mobile number');
    return false;
  }

  const cleanMobile = mobile.trim();

  try {
    console.log('🔍 Login success: Verifying subscription status', { mobile: cleanMobile, portalId });
    
    const statusData = await checkUserStatus(cleanMobile, portalId);
    const isActive = isUserSubscribed(statusData);
    
    console.log('📊 Login verification result:', { active: statusData?.active, isActive });
    
    if (isActive) {
      const redirectUrl = statusData?.portalSuccessUrl 
        ? (statusData.portalSuccessUrl.startsWith('http') 
            ? `${statusData.portalSuccessUrl}${cleanMobile}` 
            : `https://${statusData.portalSuccessUrl}${cleanMobile}`)
        : `/?id=${portalId}`;
      console.log('✅ Subscribed user - redirecting to:', redirectUrl);
      
      localStorage.setItem('isSubscribed', 'true');
      localStorage.setItem('userMobile', cleanMobile);
      localStorage.setItem('subscriptionData', JSON.stringify(statusData));
      
      window.location.href = redirectUrl;
      return true;
    } else {
      console.log('❌ User not subscribed - staying on current page');
      localStorage.removeItem('isSubscribed');
      localStorage.removeItem('subscriptionData');
      localStorage.setItem('userMobile', cleanMobile);
      return false;
    }
  } catch (error) {
    console.error('❌ Login verification failed:', error);
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('subscriptionData');
    localStorage.setItem('userMobile', cleanMobile);
    return false;
  }
};
