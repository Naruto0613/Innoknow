/**
 * Generates a unique device fingerprint using screen resolution, timezone, browser, and OS combination
 */
export const getDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return 'unknown_device';
  
  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const timezone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'UTC';
  const userAgent = navigator?.userAgent || 'unknown_browser';
  const platform = navigator?.platform || 'unknown_os';
  
  const rawString = `${screenRes}|${timezone}|${userAgent}|${platform}`;
  
  // Simple deterministic string hashing algorithm
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  return 'DV_' + Math.abs(hash).toString(36).toUpperCase();
};
