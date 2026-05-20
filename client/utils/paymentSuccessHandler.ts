/**
 * Payment Success Handler
 */

export const handlePaymentSuccess = (mobile: string, portalId: string | number = '1') => {
  const redirectUrl = `https://eyoga.live/?msisdn=${mobile}&id=${portalId}`;
  
  console.log('🎉 Payment successful - redirecting to:', redirectUrl);
  
  window.location.href = redirectUrl;
};

export const isPaymentSuccessCallback = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('payment_status') && urlParams.get('payment_status') === 'success';
};

export const getPaymentSuccessData = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (!isPaymentSuccessCallback()) {
    return null;
  }
  
  return {
    mobile: urlParams.get('mobile'),
    portalId: urlParams.get('portal_id') || '1',
    transactionId: urlParams.get('transaction_id'),
    amount: urlParams.get('amount')
  };
};
