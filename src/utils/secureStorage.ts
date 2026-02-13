import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'yt-crm-secure-key-2024'; // TODO: Move to env vars

/**
 * Encrypt data using AES encryption
 */
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt data using AES decryption
 */
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Store encrypted data in cookies
 */
export const setSecureCookie = (key: string, value: string, options?: Cookies.CookieAttributes): void => {
  const encryptedValue = encryptData(value);
  Cookies.set(key, encryptedValue, {
    secure: import.meta.env.PROD, // Secure only in production (HTTPS)
    sameSite: 'strict',
    expires: 7, // 7 days
    httpOnly: false, // Allow JavaScript access
    ...options
  });
};

/**
 * Get and decrypt data from cookies
 */
export const getSecureCookie = (key: string): string | null => {
  const encryptedValue = Cookies.get(key);
  if (!encryptedValue) return null;

  try {
    return decryptData(encryptedValue);
  } catch (error) {
    console.error('Failed to decrypt cookie data:', error);
    // Remove corrupted cookie
    Cookies.remove(key);
    return null;
  }
};

/**
 * Remove cookie
 */
export const removeSecureCookie = (key: string): void => {
  Cookies.remove(key);
};

/**
 * Clear all secure cookies
 */
export const clearSecureCookies = (): void => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach(key => {
    Cookies.remove(key);
  });
};