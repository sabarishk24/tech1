import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { INITIAL_ALERTS, INITIAL_LEDGER } from './data';
import { getTranslation } from './i18n';
import { requireSupabase, supabase } from './supabaseClient';
import { ActivityLog, Alert, BundleItem, FarmProfile, Language, LedgerEntry, Screen, ToastData, UpcomingEvent, User } from './types';

interface AppContextType {
  currentScreen: Screen;
  screenHistory: Screen[];
  navigate: (screen: Screen) => void;
  back: () => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string, mode?: 'login' | 'register') => Promise<void>;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
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
  createBookings: (items: BundleItem[], scheduledFor: string) => Promise<void>;
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
  const [language, setLang] = useState<Language>(() => {
    const saved = window.localStorage.getItem('valam-language');
    return saved === 'ta' || saved === 'hi' || saved === 'te' || saved === 'kn' || saved === 'ml' || saved === 'en'
      ? saved
      : 'en';
  });
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

  const resetLocalState = useCallback(() => {
    setUser(null);
    setFarmProfileState(null);
    setLedgerEntries([]);
    setEnquiries([]);
    setBundle([]);
    setPdfDownloads(0);
  }, []);

  const loadAccount = useCallback(async (authUser: { id: string; email?: string; user_metadata: Record<string, unknown> }) => {
    const client = requireSupabase();
    const [{ data: profile, error: profileError }, { data: farms }, { data: entries }, { data: enquiries }] = await Promise.all([
      client.from('profiles').select('full_name, phone, role, preferred_language').eq('id', authUser.id).single(),
      client.from('farms').select('*, farm_crops(crop_name)').eq('farmer_id', authUser.id).order('created_at', { ascending: true }).limit(1),
      client.from('ledger_entries').select('*').eq('farmer_id', authUser.id).order('entry_date', { ascending: false }),
      client.from('market_enquiries').select('*').eq('farmer_id', authUser.id).order('created_at', { ascending: false }),
    ]);
    if (profileError) throw profileError;
    setUser({
      id: authUser.id,
      name: profile.full_name || String(authUser.user_metadata.full_name || 'VALAM user'),
      phone: profile.phone || '',
      email: authUser.email,
      role: profile.role,
    });
    const savedLanguage = window.localStorage.getItem('valam-language');
    const profileLanguage = profile.preferred_language;
    const hasSavedLanguage = savedLanguage === 'en' || savedLanguage === 'ta' || savedLanguage === 'hi' || savedLanguage === 'te' || savedLanguage === 'kn' || savedLanguage === 'ml';
    const hasProfileLanguage = profileLanguage === 'en' || profileLanguage === 'ta' || profileLanguage === 'hi' || profileLanguage === 'te' || profileLanguage === 'kn' || profileLanguage === 'ml';
    // A choice just made in this browser must not be overwritten by an older
    // profile value while Google Translate reloads the page.
    const preferredLanguage = hasSavedLanguage ? savedLanguage : hasProfileLanguage ? profileLanguage : 'en';
    if (preferredLanguage) {
      setLang(preferredLanguage);
      window.localStorage.setItem('valam-language', preferredLanguage);
      document.documentElement.lang = preferredLanguage;
    }
    const farm = farms?.[0];
    setFarmProfileState(farm ? {
      district: farm.district,
      state: farm.state,
      lat: Number(farm.latitude ?? 0),
      lng: Number(farm.longitude ?? 0),
      landSize: Number(farm.land_size_acres),
      soilType: farm.soil_type ?? '',
      crops: (farm.farm_crops ?? []).map((crop: { crop_name: string }) => crop.crop_name),
      irrigationType: farm.irrigation_type ?? '',
      isComplete: farm.is_complete,
    } : null);
    setLedgerEntries((entries ?? []).map(entry => ({
      id: entry.id,
      type: entry.entry_type,
      category: entry.category,
      amount: Number(entry.amount),
      description: entry.description ?? '',
      date: entry.entry_date,
      photoUrl: entry.receipt_path ?? undefined,
    })));
    setEnquiries((enquiries ?? []).map(enquiry => ({
      id: enquiry.id,
      farmer: profile.full_name,
      crop: enquiry.crop_name,
      quantity: String(enquiry.quantity),
      mandi: enquiry.market_name,
      date: enquiry.created_at.slice(0, 10),
      status: enquiry.status,
    })));
    setCurrentScreen('home');
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadAccount(session.user).catch(console.error);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) window.setTimeout(() => loadAccount(session.user).catch(console.error), 0);
      else resetLocalState();
    });
    return () => subscription.unsubscribe();
  }, [loadAccount, resetLocalState]);

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

  // The temporary Google widget needs English source text on each reload.
  // Our bundled catalogue remains available for the later production version.
  const t = useCallback((key: string) => getTranslation('en', key), []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    window.localStorage.setItem('valam-language', lang);
    document.documentElement.lang = lang;
    if (user && supabase) {
      const { error } = await supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id);
      if (error) console.error('Could not save language preference', error);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const login = useCallback(async (email: string, password: string, name?: string, mode: 'login' | 'register' = 'login') => {
    const client = requireSupabase();
    if (mode === 'register') {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: name?.trim() || '', role: 'farmer' }, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      if (!data.session) throw new Error('Check your email to confirm your VALAM account, then sign in.');
      await loadAccount(data.session.user);
    } else {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadAccount(data.user);
    }
    setScreenHistory([]);
  }, [loadAccount]);

  const logout = useCallback(() => {
    supabase?.auth.signOut().catch(console.error);
    resetLocalState();
    setCurrentScreen('language');
    setScreenHistory([]);
  }, [resetLocalState]);

  // Remaining demo-only UI state will move to dedicated tables in later steps.
  const persist = useCallback((_patch: Record<string, unknown>) => undefined, []);

  const setFarmProfile = useCallback((profile: FarmProfile) => {
    setFarmProfileState(profile);
    if (!user || !supabase) return;
    (async () => {
      const client = requireSupabase();
      const { data: existing, error: existingError } = await client.from('farms').select('id').eq('farmer_id', user.id).limit(1).maybeSingle();
      if (existingError) throw existingError;
      const farmPayload = {
        farmer_id: user.id, name: 'My Farm', district: profile.district, state: profile.state,
        land_size_acres: profile.landSize, soil_type: profile.soilType || null,
        irrigation_type: profile.irrigationType || null, latitude: profile.lat || null,
        longitude: profile.lng || null, is_complete: profile.isComplete,
      };
      const { data: farm, error } = existing
        ? await client.from('farms').update(farmPayload).eq('id', existing.id).select('id').single()
        : await client.from('farms').insert(farmPayload).select('id').single();
      if (error) throw error;
      await client.from('farm_crops').delete().eq('farm_id', farm.id);
      if (profile.crops.length) {
        const { error: cropsError } = await client.from('farm_crops').insert(profile.crops.map(crop_name => ({ farm_id: farm.id, crop_name })));
        if (cropsError) throw cropsError;
      }
    })().catch(err => console.error('Farm profile sync failed:', err));
  }, [user]);

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

  const createBookings = useCallback(async (items: BundleItem[], scheduledFor: string) => {
    if (!user) throw new Error('Please sign in before creating a booking.');
    const client = requireSupabase();
    const { data: farm, error: farmError } = await client.from('farms').select('id').eq('farmer_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (farmError) throw farmError;
    for (const item of items) {
      const { error } = await client.rpc('create_booking', {
        requested_service_id: item.serviceId,
        requested_farm_id: farm?.id ?? null,
        requested_quantity: item.quantity,
        requested_for: scheduledFor,
        requested_notes: null,
      });
      if (error) throw error;
    }
    setBundle([]);
  }, [user]);

  const addLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => [entry, ...l]);
    if (!user || !supabase) return;
    (async () => {
      const { data, error } = await requireSupabase().from('ledger_entries').insert({
        farmer_id: user.id,
        entry_type: entry.type,
        category: entry.category,
        amount: entry.amount,
        description: entry.description || null,
        entry_date: entry.date,
        receipt_path: entry.photoUrl || null,
      }).select().single();
      if (error) throw error;
      setLedgerEntries(entries => entries.map(item => item.id === entry.id ? {
        ...item, id: data.id, date: data.entry_date,
      } : item));
    })().catch(err => console.error('Ledger entry sync failed:', err));
  }, [user]);

  const updateLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries(l => l.map(x => x.id === entry.id ? entry : x));
    if (!user || !supabase) return;
    requireSupabase().from('ledger_entries').update({
      entry_type: entry.type, category: entry.category, amount: entry.amount,
      description: entry.description || null, entry_date: entry.date,
      receipt_path: entry.photoUrl || null,
    }).eq('id', entry.id).eq('farmer_id', user.id).then(({ error }) => {
      if (error) console.error('Ledger entry update failed:', error);
    });
  }, [user]);

  const deleteLedgerEntry = useCallback((id: string) => {
    setLedgerEntries(l => l.filter(x => x.id !== id));
    if (!user || !supabase) return;
    requireSupabase().from('ledger_entries').delete().eq('id', id).eq('farmer_id', user.id).then(({ error }) => {
      if (error) console.error('Ledger entry deletion failed:', error);
    });
  }, [user]);

  const addEnquiry = useCallback((e: { id: string; farmer: string; crop: string; quantity: string; mandi: string; date: string; status: string }) => {
    setEnquiries(prev => [e, ...prev]);
    if (!user || !supabase) return;
    (async () => {
      const { data, error } = await requireSupabase().from('market_enquiries').insert({
        farmer_id: user.id,
        crop_name: e.crop,
        quantity: Number(e.quantity),
        market_name: e.mandi,
        district: farmProfile?.district || 'Not specified',
      }).select().single();
      if (error) throw error;
      setEnquiries(items => items.map(item => item.id === e.id ? { ...item, id: data.id, status: data.status } : item));
    })().catch(err => console.error('Marketplace enquiry sync failed:', err));
  }, [farmProfile?.district, user]);

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
      bundle, addToBundle, removeFromBundle, clearBundle, createBookings, hasBackup, setHasBackup: (v: boolean) => { setHasBackup(v); persist({ hasBackup: v }); },
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
