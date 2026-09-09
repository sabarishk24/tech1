import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEMO_FARM, DEMO_USER, INITIAL_ALERTS, INITIAL_LEDGER } from './data';
import { getTranslation } from './i18n';
import { Alert, BundleItem, FarmProfile, Language, LedgerEntry, Screen, ToastData, User } from './types';

interface AppContextType {
  currentScreen: Screen;
  screenHistory: Screen[];
  navigate: (screen: Screen) => void;
  back: () => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  farmProfile: FarmProfile | null;
  setFarmProfile: (profile: FarmProfile) => void;
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
  pdfDownloads: number;
  incrementPdfDownloads: () => void;
  bundle: BundleItem[];
  addToBundle: (item: BundleItem) => void;
  removeFromBundle: (serviceId: string) => void;
  clearBundle: () => void;
  hasBackup: boolean;
  setHasBackup: (v: boolean) => void;
  ledgerEntries: LedgerEntry[];
  addLedgerEntry: (entry: LedgerEntry) => void;
  updateLedgerEntry: (entry: LedgerEntry) => void;
  deleteLedgerEntry: (id: string) => void;
  toasts: ToastData[];
  showToast: (message: string, type?: ToastData['type']) => void;
  moreSheetOpen: boolean;
  setMoreSheetOpen: (v: boolean) => void;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('language');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLang] = useState<Language>('en');
  const [farmProfile, setFarmProfileState] = useState<FarmProfile | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [pdfDownloads, setPdfDownloads] = useState(0);
  const [bundle, setBundle] = useState<BundleItem[]>([]);
  const [hasBackup, setHasBackup] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const navigate = useCallback((screen: Screen) => {
    setScreenHistory(h => [...h, currentScreen]);
    setCurrentScreen(screen);
    setMoreSheetOpen(false);
  }, [currentScreen]);

  const back = useCallback(() => {
    setScreenHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setCurrentScreen(prev);
      return h.slice(0, -1);
    });
  }, []);

  const t = useCallback((key: string) => getTranslation(language, key), [language]);

  const setLanguage = useCallback((lang: Language) => setLang(lang), []);

  const login = useCallback((phone: string, name?: string) => {
    const u: User = { ...DEMO_USER, phone, name: name ?? DEMO_USER.name, id: 'u1', role: 'farmer' };
    setUser(u);
    setFarmProfileState(DEMO_FARM);
    setCurrentScreen('home');
    setScreenHistory([]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFarmProfileState(null);
    setCurrentScreen('language');
    setScreenHistory([]);
    setBundle([]);
    setPdfDownloads(0);
  }, []);

  const setFarmProfile = useCallback((profile: FarmProfile) => setFarmProfileState(profile), []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts(a => a.map(alert => alert.id === id ? { ...alert, isRead: true } : alert));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts(a => a.map(alert => ({ ...alert, isRead: true })));
  }, []);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const incrementPdfDownloads = useCallback(() => setPdfDownloads(n => Math.min(n + 1, 3)), []);

  const addToBundle = useCallback((item: BundleItem) => {
    setBundle(b => {
      const exists = b.find(x => x.serviceId === item.serviceId);
      if (exists) return b.map(x => x.serviceId === item.serviceId ? { ...x, quantity: x.quantity + 1 } : x);
      return [...b, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromBundle = useCallback((serviceId: string) => {
    setBundle(b => b.filter(x => x.serviceId !== serviceId));
  }, []);

  const clearBundle = useCallback(() => setBundle([]), []);

  const addLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => [entry, ...l]);
  }, []);

  const updateLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => l.map(x => x.id === entry.id ? entry : x));
  }, []);

  const deleteLedgerEntry = useCallback((id: string) => {
    setLedgerEntries(l => l.filter(x => x.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = String(++toastIdRef.current);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  return (
    <AppContext.Provider value={{
      currentScreen, screenHistory, navigate, back,
      user, isAuthenticated: !!user, login, logout,
      language, setLanguage, t,
      farmProfile, setFarmProfile,
      alerts, markAlertRead, markAllRead, unreadCount,
      pdfDownloads, incrementPdfDownloads,
      bundle, addToBundle, removeFromBundle, clearBundle, hasBackup, setHasBackup,
      ledgerEntries, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry,
      toasts, showToast,
      moreSheetOpen, setMoreSheetOpen,
      isOnline,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
