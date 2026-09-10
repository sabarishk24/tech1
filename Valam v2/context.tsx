import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEMO_FARM, DEMO_USER, INITIAL_ALERTS, INITIAL_LEDGER } from './data';
import { getTranslation } from './i18n';
import { api, BackendState } from './api';
import { ActivityLog, Alert, BundleItem, FarmProfile, Language, LedgerEntry, Screen, ToastData, UpcomingEvent, User } from './types';

interface AppContextType {
  currentScreen: Screen;
  screenHistory: Screen[];
  navigate: (screen: Screen) => void;
  back: () => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, name?: string, otp?: string) => Promise<void>;
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
  enquiries: { id: string; farmer: string; crop: string; quantity: string; mandi: string; date: string; status: string }[];
  addEnquiry: (e: { id: string; farmer: string; crop: string; quantity: string; mandi: string; date: string; status: string }) => void;
  activityLog: ActivityLog[];
  logActivity: (entry: Omit<ActivityLog, 'id'>) => void;
  upcomingEvents: UpcomingEvent[];
  addUpcomingEvent: (event: Omit<UpcomingEvent, 'id'>) => void;
  removeUpcomingEvent: (id: string) => void;
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
  const [enquiries, setEnquiries] = useState<{ id: string; farmer: string; crop: string; quantity: string; mandi: string; date: string; status: string }[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([
    { id: 'act0', type: 'account', title: 'Account Created', detail: 'Registered as Arjun Kumar · Farmer', timestamp: '2026-09-01T09:00:00', icon: '🎉' },
    { id: 'act1', type: 'profile', title: 'Farm Profile Set Up', detail: 'Chengalpattu · 3 acres · Paddy, Groundnut', timestamp: '2026-09-01T09:15:00', icon: '🌾' },
    { id: 'act2', type: 'booking', title: 'Tractor Booked', detail: 'Rajan Tractors · 8hr · ₹2,200', timestamp: '2026-09-02T10:30:00', icon: '🚜' },
    { id: 'act3', type: 'ledger', title: 'Expense Recorded', detail: 'NPK Fertilizer · ₹3,750', timestamp: '2026-09-02T14:00:00', icon: '📒' },
    { id: 'act4', type: 'ledger', title: 'Income Recorded', detail: 'Groundnut Sale · ₹18,000', timestamp: '2026-09-03T11:00:00', icon: '💰' },
    { id: 'act5', type: 'test', title: 'Soil Test Booked', detail: 'TNAU Lab · Chengalpattu · Sep 6', timestamp: '2026-09-04T09:00:00', icon: '🧪' },
    { id: 'act6', type: 'scheme', title: 'Scheme Applied', detail: 'PM-KISAN · ₹6,000/year', timestamp: '2026-09-05T15:00:00', icon: '📋' },
    { id: 'act7', type: 'sell', title: 'Market Enquiry Sent', detail: 'Paddy · Chengalpattu APMC · 30 qtl', timestamp: '2026-09-06T10:00:00', icon: '📩' },
  ]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([
    { id: 'ev1', title: 'Tractor Booking — Rajan Tractors', date: 'Sep 12, 2026', type: 'booking', icon: '🚜', priority: 'high' },
    { id: 'ev2', title: 'Soil Test Visit — TNAU Lab', date: 'Sep 14, 2026', type: 'test', icon: '🧪', priority: 'high' },
    { id: 'ev3', title: 'Apply 2nd Dose Urea', date: 'Sep 10, 2026', type: 'task', icon: '🌿', priority: 'high' },
    { id: 'ev4', title: 'PM-KISAN Deadline', date: 'Sep 30, 2026', type: 'deadline', icon: '📋', priority: 'medium' },
    { id: 'ev5', title: 'Harvester Booking — Oct 15', date: 'Oct 15, 2026', type: 'booking', icon: '🌾', priority: 'medium' },
  ]);
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

  useEffect(() => {
    const savedId = localStorage.getItem('valam_user_id');
    if (!savedId) return;
    api.getState(savedId).then((state) => {
      setUser(state.user);
      setFarmProfileState(state.farmProfile ?? null);
      setAlerts(state.alerts ?? []);
      setPdfDownloads(state.pdfDownloads ?? 0);
      setBundle(state.bundle ?? []);
      setHasBackup(state.hasBackup ?? false);
      setLedgerEntries(state.ledgerEntries ?? []);
      setEnquiries(state.enquiries ?? []);
      setActivityLog(state.activityLog ?? []);
      setUpcomingEvents(state.upcomingEvents ?? []);
      setCurrentScreen('home');
    }).catch(() => localStorage.removeItem('valam_user_id'));
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

  const login = useCallback(async (phone: string, name?: string, otp = '123456') => {
    const isDemo = phone.replace(/\D/g, '') === '9876543210';
    const response = await api.verifyOtp(phone, otp, name, isDemo ? { farmProfile: DEMO_FARM, alerts: INITIAL_ALERTS, ledgerEntries: INITIAL_LEDGER, activityLog: activityLog, upcomingEvents: upcomingEvents } : undefined);
    const state = response as BackendState;
    const u: User = state.user;
    setUser(u);
    localStorage.setItem('valam_user_id', u.id);
    // Existing/demo accounts retain the original UI data. New accounts start with
    // an empty farm profile so the app never pretends to know a farmer's soil health.
    setFarmProfileState(state.farmProfile ?? null);
    setAlerts(state.alerts ?? []);
    setPdfDownloads(state.pdfDownloads ?? 0);
    setBundle(state.bundle ?? []);
    setHasBackup(state.hasBackup ?? false);
    setLedgerEntries(state.ledgerEntries ?? []);
    setEnquiries(state.enquiries ?? []);
    setActivityLog(state.activityLog ?? []);
    setUpcomingEvents(state.upcomingEvents ?? []);
    setCurrentScreen(state.farmProfile?.isComplete === false ? 'home' : 'home');
    setScreenHistory([]);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('valam_user_id');
    setUser(null);
    setFarmProfileState(null);
    setCurrentScreen('language');
    setScreenHistory([]);
    setBundle([]);
    setPdfDownloads(0);
  }, []);

  const persist = useCallback((patch: Partial<BackendState>) => {
    if (!user) return;
    api.saveState(user.id, patch).catch(err => console.warn('Backend sync failed:', err));
  }, [user]);

  const setFarmProfile = useCallback((profile: FarmProfile) => {
    setFarmProfileState(profile);
    persist({ farmProfile: profile });
  }, [persist]);

  const markAlertRead = useCallback((id: string) => {
    setAlerts(a => { const next = a.map(alert => alert.id === id ? { ...alert, isRead: true } : alert); persist({ alerts: next }); return next; });
  }, [persist]);

  const markAllRead = useCallback(() => {
    setAlerts(a => { const next = a.map(alert => ({ ...alert, isRead: true })); persist({ alerts: next }); return next; });
  }, [persist]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const incrementPdfDownloads = useCallback(() => setPdfDownloads(n => { const next = Math.min(n + 1, 3); persist({ pdfDownloads: next }); return next; }), [persist]);

  const addToBundle = useCallback((item: BundleItem) => {
    setBundle(b => {
      const exists = b.find(x => x.serviceId === item.serviceId);
      const next = exists
        ? b.map(x => x.serviceId === item.serviceId ? { ...x, quantity: x.quantity + 1 } : x)
        : [...b, { ...item, quantity: 1 }];
      persist({ bundle: next });
      return next;
    });
  }, [persist]);

  const removeFromBundle = useCallback((serviceId: string) => {
    setBundle(b => { const next = b.filter(x => x.serviceId !== serviceId); persist({ bundle: next }); return next; });
  }, [persist]);

  const clearBundle = useCallback(() => { setBundle([]); persist({ bundle: [] }); }, [persist]);

  const addLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => { const next = [entry, ...l]; persist({ ledgerEntries: next }); return next; });
  }, [persist]);

  const updateLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => { const next = l.map(x => x.id === entry.id ? entry : x); persist({ ledgerEntries: next }); return next; });
  }, [persist]);

  const deleteLedgerEntry = useCallback((id: string) => {
    setLedgerEntries(l => { const next = l.filter(x => x.id !== id); persist({ ledgerEntries: next }); return next; });
  }, [persist]);

  const addEnquiry = useCallback((e: { id: string; farmer: string; crop: string; quantity: string; mandi: string; date: string; status: string }) => {
    setEnquiries(prev => { const next = [e, ...prev]; persist({ enquiries: next }); return next; });
  }, [persist]);

  const logActivity = useCallback((entry: Omit<ActivityLog, 'id'>) => {
    const id = `act-${Date.now()}`;
    setActivityLog(prev => { const next = [{ ...entry, id }, ...prev]; persist({ activityLog: next }); return next; });
  }, [persist]);

  const addUpcomingEvent = useCallback((event: Omit<UpcomingEvent, 'id'>) => {
    const id = `ev-${Date.now()}`;
    setUpcomingEvents(prev => { const next = [{ ...event, id }, ...prev]; persist({ upcomingEvents: next }); return next; });
  }, [persist]);

  const removeUpcomingEvent = useCallback((id: string) => {
    setUpcomingEvents(prev => { const next = prev.filter(e => e.id !== id); persist({ upcomingEvents: next }); return next; });
  }, [persist]);

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
      bundle, addToBundle, removeFromBundle, clearBundle, hasBackup, setHasBackup: (v: boolean) => { setHasBackup(v); persist({ hasBackup: v }); },
      ledgerEntries, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry,
      toasts, showToast,
      enquiries, addEnquiry,
      activityLog, logActivity,
      upcomingEvents, addUpcomingEvent, removeUpcomingEvent,
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
