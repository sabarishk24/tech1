import React from 'react';
import { useApp } from '../context';
import { Screen } from '../types';
import valamLogo from '../imports/WhatsApp_Image_2026-09-10_at_12.25.49_AM.jpeg';
import { applyGooglePageTranslation } from '../googleTranslate';
import {
  BellIcon, BookIcon, BundleIcon, CalculatorIcon, CartIcon,
  ChevronRightIcon, FarmIcon, GlobeIcon, HomeIcon, LeafIcon,
  LocationIcon, MenuIcon, SchemeIcon, SettingsIcon, ShieldIcon, ToolsIcon,
  UserIcon, XIcon
} from './ui';

interface NavItem {
  key: Screen;
  labelKey: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { key: 'home', labelKey: 'nav.home', icon: <HomeIcon size={20} /> },
  { key: 'farm-profile', labelKey: 'nav.farm', icon: <FarmIcon size={20} /> },
  { key: 'estimator', labelKey: 'nav.estimator', icon: <CalculatorIcon size={20} /> },
  { key: 'smart-sell', labelKey: 'nav.smartSell', icon: <CartIcon size={20} /> },
  { key: 'amenities', labelKey: 'nav.amenities', icon: <ToolsIcon size={20} /> },
  { key: 'ledger', labelKey: 'nav.ledger', icon: <BookIcon size={20} /> },
  { key: 'alerts', labelKey: 'nav.alerts', icon: <BellIcon size={20} /> },
  { key: 'schemes', labelKey: 'nav.schemes', icon: <SchemeIcon size={20} /> },
  { key: 'disease', labelKey: 'nav.disease', icon: <LeafIcon size={20} /> },
  { key: 'profile', labelKey: 'nav.profile', icon: <UserIcon size={20} /> },
  { key: 'provider-login', labelKey: 'nav.provider', icon: <SettingsIcon size={20} /> },
  { key: 'history', labelKey: 'nav.history', icon: <BookIcon size={20} /> },
  { key: 'help', labelKey: 'nav.help', icon: <ShieldIcon size={20} /> },
];

const bottomNavItems = [
  { key: 'home' as Screen, labelKey: 'nav.home', icon: <HomeIcon size={22} /> },
  { key: 'farm-profile' as Screen, labelKey: 'nav.farm', icon: <FarmIcon size={22} /> },
  { key: 'smart-sell' as Screen, labelKey: 'nav.smartSell', icon: <CartIcon size={22} /> },
];

const moreItems: NavItem[] = [
  { key: 'estimator', labelKey: 'nav.estimator', icon: <CalculatorIcon size={20} /> },
  { key: 'amenities', labelKey: 'nav.amenities', icon: <ToolsIcon size={20} /> },
  { key: 'ledger', labelKey: 'nav.ledger', icon: <BookIcon size={20} /> },
  { key: 'alerts', labelKey: 'nav.alerts', icon: <BellIcon size={20} /> },
  { key: 'schemes', labelKey: 'nav.schemes', icon: <SchemeIcon size={20} /> },
  { key: 'disease', labelKey: 'nav.disease', icon: <LeafIcon size={20} /> },
  { key: 'profile', labelKey: 'nav.profile', icon: <UserIcon size={20} /> },
  { key: 'provider-login', labelKey: 'nav.provider', icon: <SettingsIcon size={20} /> },
  { key: 'history', labelKey: 'nav.history', icon: <BookIcon size={20} /> },
  { key: 'help', labelKey: 'nav.help', icon: <ShieldIcon size={20} /> },
];

const LANGUAGES = [
  { code: 'en' as const, label: 'EN' },
  { code: 'ta' as const, label: 'தமிழ்' },
  { code: 'hi' as const, label: 'हिं' },
  { code: 'te' as const, label: 'తె' },
  { code: 'kn' as const, label: 'ಕಂ' },
  { code: 'ml' as const, label: 'മ' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentScreen, navigate, t, language, setLanguage, unreadCount, farmProfile, user, moreSheetOpen, setMoreSheetOpen } = useApp();

  const handleNav = (screen: Screen) => {
    navigate(screen);
    setMoreSheetOpen(false);
  };

  return (
    <div className="flex h-full bg-background">
      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border/60 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
          <div className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0">
            <img src={valamLogo} alt="VALAM" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-black text-primary text-lg leading-none font-display">{t('app.name')}</div>
            <div className="text-[10px] text-muted mt-0.5">{farmProfile?.district ?? 'Chengalpattu'}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {mainNavItems.map(item => {
            const active = currentScreen === item.key;
            const hasAlert = item.key === 'alerts' && unreadCount > 0;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all mb-0.5 relative ${active ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
              >
                <span className={active ? 'text-white' : 'text-muted'}>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
                {hasAlert && (
                  <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-[12px] bg-surface-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.[0] ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text truncate">{user?.name ?? 'Arjun Kumar'}</div>
              <div className="text-[11px] text-muted">{t('profile.farmer')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="bg-white border-b border-border/50 flex items-center gap-3 px-4 py-3 flex-shrink-0 z-10">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted flex-1 min-w-0">
            <LocationIcon size={14} />
            <span className="text-xs truncate">{farmProfile?.district ?? 'Chengalpattu'}, TN</span>
          </div>

          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-surface-2 rounded-[10px] p-0.5">
            <GlobeIcon size={14} className="ml-1.5 text-muted" />
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={async () => {
                  await setLanguage(l.code);
                  applyGooglePageTranslation(l.code);
                }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-[8px] transition-all ${language === l.code ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Alerts bell */}
          <button
            onClick={() => navigate('alerts')}
            className="relative w-9 h-9 flex items-center justify-center rounded-[10px] hover:bg-surface-2 text-muted hover:text-text transition-colors"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('profile')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs hover:opacity-90 transition-opacity"
          >
            {user?.name?.[0] ?? 'A'}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 flex z-20 safe-area-pb">
        {bottomNavItems.map(item => {
          const active = currentScreen === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className="flex-1 flex flex-col items-center gap-1 py-2 min-h-[56px]"
            >
              <span className={active ? 'text-primary' : 'text-muted'}>{item.icon}</span>
              <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted'}`}>{t(item.labelKey)}</span>
            </button>
          );
        })}
        {/* More */}
        <button
          onClick={() => setMoreSheetOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2 min-h-[56px]"
        >
          <span className={`relative ${moreSheetOpen ? 'text-primary' : 'text-muted'}`}>
            <MenuIcon size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </span>
          <span className={`text-[10px] font-semibold ${moreSheetOpen ? 'text-primary' : 'text-muted'}`}>{t('nav.more')}</span>
        </button>
      </nav>

      {/* ── More Sheet (mobile) ───────────────────────────────────── */}
      {moreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] pb-safe">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="font-bold text-text text-base">{t('nav.more')}</span>
              <button onClick={() => setMoreSheetOpen(false)} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted">
                <XIcon size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {moreItems.map(item => {
                const active = currentScreen === item.key;
                const hasAlert = item.key === 'alerts' && unreadCount > 0;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-[14px] min-h-[80px] transition-all relative ${active ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-green-50'}`}
                  >
                    <span className={active ? 'text-white' : 'text-primary'}>{item.icon}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight">{t(item.labelKey)}</span>
                    {hasAlert && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Language switcher in more sheet */}
            <div className="px-4 pb-6 pt-2 border-t border-border/50">
              <p className="text-xs text-muted mb-2 font-medium">{t('lang.select')}</p>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={async () => {
                      await setLanguage(l.code);
                      applyGooglePageTranslation(l.code);
                    }}
                    className={`flex-1 py-2 rounded-[10px] text-sm font-bold transition-all ${language === l.code ? 'bg-primary text-white' : 'bg-surface-2 text-text'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Back button for screen headers
export function BackButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const { t } = useApp();
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-primary font-semibold text-sm hover:opacity-80 transition-opacity min-h-[44px] px-1">
      <ChevronRightIcon size={18} className="rotate-180" />
      {label ?? t('common.back')}
    </button>
  );
}

// Screen header
export function ScreenHeader({ title, subtitle, back, action }: {
  title: string; subtitle?: string; back?: () => void; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 px-4 pt-4 pb-3">
      {back && <BackButton onClick={back} />}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-black text-text font-display">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Wizard footer
export function WizardFooter({ onBack, onContinue, onSkip, continueLabel, backLabel, skipLabel, loading, disabled }: {
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { t } = useApp();
  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-white border-t border-border/50 sticky bottom-0">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted font-semibold text-sm hover:text-text transition-colors min-h-[44px] px-3">
          <ChevronRightIcon size={16} className="rotate-180" />
          {backLabel ?? t('common.back')}
        </button>
      )}
      <div className="flex-1" />
      {onSkip && (
        <button onClick={onSkip} className="text-muted text-sm font-medium hover:text-text transition-colors min-h-[44px] px-3">
          {skipLabel ?? t('common.skip')}
        </button>
      )}
      {onContinue && (
        <button
          onClick={onContinue}
          disabled={disabled || loading}
          className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-[14px] min-h-[44px] hover:bg-primary-dark disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
        >
          {continueLabel ?? t('common.continue')}
          {!loading && <ChevronRightIcon size={16} />}
        </button>
      )}
    </div>
  );
}
