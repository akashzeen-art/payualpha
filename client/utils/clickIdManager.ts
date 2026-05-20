/**
 * ClickID Management Utility
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidClickId = (clickId: string | null | undefined): boolean => {
  if (!clickId) return false;
  const normalizedClickId = clickId.trim();
  if (normalizedClickId === '') return false;
  if (normalizedClickId.toLowerCase() === 'null') return false;
  if (UUID_REGEX.test(normalizedClickId)) return false;
  return true;
};

export const getClickIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('clickid');
};

export const getPortalIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
};

export const getMsisdnFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('msisdn');
};

export const getOrGenerateClickId = (_portalId: string | number): string => {
  return getClickIdFromUrl() || '';
};

export const updateUrlWithClickId = (clickId: string, portalId: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set('clickid', clickId);
  if (portalId) url.searchParams.set('id', String(portalId));
  window.history.replaceState({}, '', url.toString());
};

export const initializeClickId = () => {
  const portalId = getPortalIdFromUrl() || '1';
  const clickId = getClickIdFromUrl();
  return { clickId, portalId };
};
