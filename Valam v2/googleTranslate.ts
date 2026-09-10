import { Language } from './types';

/**
 * Temporary hackathon helper for Google's legacy Website Translator.
 * Google reads the googtrans cookie while loading and translates the rendered
 * page. A reload is the reliable way to change languages in a React SPA.
 */
export function applyGooglePageTranslation(language: Language) {
  const expires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT';
  if (language === 'en') {
    // The Google widget can create the cookie with either host-only or domain
    // scope. Clear both forms so returning to English always works.
    const expired = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = expired;
    document.cookie = `${expired}; domain=${window.location.hostname}`;
    const domainParts = window.location.hostname.split('.');
    if (domainParts.length > 1) {
      document.cookie = `${expired}; domain=.${domainParts.slice(-2).join('.')}`;
    }
  } else {
    document.cookie = `googtrans=/en/${language}; ${expires}; path=/`;
  }
  window.location.reload();
}
