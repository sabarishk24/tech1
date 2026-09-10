import { useState } from 'react';
import { useApp } from '../context';
import { Badge, Card, TrendUpIcon, WeatherIcon, BellIcon } from '../components/ui';
import { Screen } from '../types';

const FARMING_TIPS = [
  { tip: "Apply Urea in split doses — 50% at basal, 25% at tillering, 25% at panicle initiation for paddy.", tag: 'Fertilizer' },
  { tip: "Rotate your crops every 2–3 seasons to restore soil nitrogen and break pest cycles naturally.", tag: 'Soil Health' },
  { tip: "Water paddy at 5 cm depth during tillering and flowering — overwatering wastes water and nutrients.", tag: 'Irrigation' },
  { tip: "Check the underside of paddy leaves weekly for BPH eggs — early detection saves 30% yield.", tag: 'Pest Control' },
  { tip: "Add 2–3 tons of FYM (farmyard manure) per acre before planting to improve soil water retention.", tag: 'Organic' },
  { tip: "Apply Azospirillum biofertilizer as seed treatment to save 25% on nitrogen fertilizer cost.", tag: 'Input Cost' },
  { tip: "Monitor weather forecasts before spraying — rain within 4 hours washes off pesticides.", tag: 'Weather' },
  { tip: "Maintain field bunds properly — poor bunds waste up to 40% irrigation water during kharif.", tag: 'Water' },
  { tip: "Use sticky yellow traps at 25 per acre to monitor whitefly and thrip populations in groundnut.", tag: 'Pest Control' },
  { tip: "Harvest paddy when 80-85% of grains are golden yellow — early harvest reduces milling loss.", tag: 'Harvest' },
];

export default function HomeScreen() {
  const { t, farmProfile, navigate, unreadCount, user, ledgerEntries, upcomingEvents, removeUpcomingEvent, addUpcomingEvent, logActivity } = useApp();
  const [plannerTab, setPlannerTab] = useState<'upcoming' | 'ledger'>('upcoming');
  const [tipIndex, setTipIndex] = useState(0);
  const [soilTestBooked, setSoilTestBooked] = useState(false);

  const income = ledgerEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = ledgerEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const refreshTip = () => setTipIndex(i => (i + 1) % FARMING_TIPS.length);

  const handleBookSoilTest = () => {
    setSoilTestBooked(true);
    addUpcomingEvent({ title: 'Soil Test Visit — TNAU Lab', date: 'Sep 18, 2026', type: 'test', icon: '🧪', priority: 'high' });
    logActivity({ type: 'test', title: 'Soil Test Booked', detail: 'TNAU Lab · Chengalpattu · Sep 18', timestamp: new Date().toISOString(), icon: '🧪' });
  };

  const quickActions: { label: string; icon: string; screen: Screen; color: string }[] = [
    { label: t('nav.estimator'), icon: '🧮', screen: 'estimator', color: 'bg-green-50 text-green-700' },
    { label: t('nav.smartSell'), icon: '📊', screen: 'smart-sell', color: 'bg-teal-50 text-teal-700' },
    { label: t('nav.amenities'), icon: '🚜', screen: 'amenities', color: 'bg-amber-50 text-amber-700' },
    { label: t('nav.disease'), icon: '🔬', screen: 'disease', color: 'bg-red-50 text-red-700' },
    { label: t('nav.schemes'), icon: '📋', screen: 'schemes', color: 'bg-blue-50 text-blue-700' },
    { label: t('nav.ledger'), icon: '📒', screen: 'ledger', color: 'bg-purple-50 text-purple-700' },
  ];

  const currentTip = FARMING_TIPS[tipIndex];

  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Greeting */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm text-muted">{t('home.greeting')},</p>
        <h1 className="text-2xl font-black text-text font-display">{user?.name ?? 'Arjun'} 👋</h1>
      </div>

      {/* Incomplete Profile banner */}
      {farmProfile && !farmProfile.isComplete && (
        <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-[14px] p-3 flex items-center gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <p className="text-sm text-amber-800 flex-1">{t('home.incompleteProfile')}</p>
          <button onClick={() => navigate('farm-profile')} className="text-xs font-bold text-amber-700 border border-amber-300 rounded-[8px] px-2.5 py-1.5 bg-white whitespace-nowrap">
            {t('home.completeNow')}
          </button>
        </div>
      )}

      {/* Status Card */}
      <div className="mx-4 mb-4">
        <StatusCard t={t} unreadCount={unreadCount} navigate={navigate} currentTip={currentTip} refreshTip={refreshTip} />
      </div>

      {/* Soil Test CTA */}
      <div className="mx-4 mb-4">
        {soilTestBooked ? (
          <div className="flex items-center gap-3 p-3.5 rounded-[16px] bg-green-50 border border-green-200">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-bold text-green-800">Soil Test Booked</p>
              <p className="text-xs text-green-600">TNAU Lab will visit Sep 18 · Report in 48hrs</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleBookSoilTest}
            className="w-full flex items-center gap-3 p-3.5 rounded-[16px] bg-white border-2 border-dashed border-primary/40 hover:border-primary hover:bg-green-50 transition-all active:scale-[0.98] text-left"
          >
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🧪</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text">Book Soil Test</p>
              <p className="text-xs text-muted">Get a TNAU-certified soil health report for your farm</p>
            </div>
            <span className="text-primary font-bold text-sm">Book →</span>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-bold text-text mb-3">{t('home.quickActions')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map(a => (
            <button
              key={a.screen}
              onClick={() => navigate(a.screen)}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-[16px] ${a.color} border border-current/10 min-h-[80px] active:scale-[0.97] transition-transform`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Events / Ledger snapshot */}
      <div className="px-4">
        <div className="flex bg-surface-2 rounded-[14px] p-1 mb-3">
          <button onClick={() => setPlannerTab('upcoming')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${plannerTab === 'upcoming' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            Upcoming {upcomingEvents.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{upcomingEvents.length}</span>}
          </button>
          <button onClick={() => setPlannerTab('ledger')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${plannerTab === 'ledger' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            {t('home.ledger')}
          </button>
        </div>

        {plannerTab === 'upcoming' ? (
          upcomingEvents.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm text-muted">No upcoming events. Book a service or test to see it here.</p>
            </Card>
          ) : (
            <Card padding="none">
              {upcomingEvents.map((ev, i) => (
                <div key={ev.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < upcomingEvents.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className="w-9 h-9 rounded-[10px] bg-surface-2 flex items-center justify-center text-lg flex-shrink-0">
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{ev.title}</p>
                    <p className="text-xs text-muted">{ev.date}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={ev.priority === 'high' ? 'red' : ev.priority === 'medium' ? 'amber' : 'gray'}>
                      {ev.type}
                    </Badge>
                    <button onClick={() => removeUpcomingEvent(ev.id)} className="w-5 h-5 rounded-full bg-surface-2 text-muted text-xs flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )
        ) : (
          <Card padding="none">
            <div className="grid grid-cols-3 divide-x divide-border/50">
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1">{t('ledger.totalIncome')}</p>
                <p className="text-base font-black text-green-600">₹{(income / 1000).toFixed(1)}K</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1">{t('ledger.totalExpense')}</p>
                <p className="text-base font-black text-red-500">₹{(expense / 1000).toFixed(1)}K</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted mb-1">{t('ledger.profit')}</p>
                <p className={`text-base font-black ${income - expense >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  ₹{((income - expense) / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <button onClick={() => navigate('ledger')} className="w-full py-2 text-sm font-semibold text-primary border border-primary/30 rounded-[10px] hover:bg-green-50 transition-colors">
                {t('nav.ledger')} →
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatusCard({ t, unreadCount, navigate, currentTip, refreshTip }: {
  t: (k: string) => string; unreadCount: number; navigate: (s: Screen) => void;
  currentTip: { tip: string; tag: string }; refreshTip: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#006D5B] rounded-[20px] p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold opacity-80">Farm Status</span>
        <span className="text-xs opacity-60">Sep 9, 2026</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* Weather */}
        <div className="bg-white/10 rounded-[14px] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <WeatherIcon size={14} className="opacity-80" />
            <span className="text-xs opacity-80">{t('home.weather')}</span>
          </div>
          <div className="text-xl font-black">32°C</div>
          <div className="text-[11px] opacity-70 mt-0.5">65% {t('home.humidity')} · 🌧️ expected</div>
        </div>

        {/* Farming Tip */}
        <button onClick={refreshTip} className="bg-white/10 rounded-[14px] p-3 text-left hover:bg-white/20 transition-colors group">
          <div className="flex items-center gap-1.5 mb-1 justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💡</span>
              <span className="text-xs opacity-80">Farming Tip</span>
            </div>
            <span className="text-[9px] opacity-50 group-hover:opacity-80">tap to refresh</span>
          </div>
          <div className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 inline-block mb-1">{currentTip.tag}</div>
          <div className="text-[11px] opacity-80 leading-snug line-clamp-2">{currentTip.tip}</div>
        </button>

        {/* Market */}
        <div className="bg-white/10 rounded-[14px] p-3 cursor-pointer" onClick={() => navigate('smart-sell')}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendUpIcon size={14} className="opacity-80" />
            <span className="text-xs opacity-80">{t('home.marketDelta')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black">₹2,150</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">+5%</span>
          </div>
          <div className="text-[11px] opacity-70 mt-0.5">Paddy /quintal</div>
        </div>

        {/* Alerts */}
        <div className="bg-white/10 rounded-[14px] p-3 cursor-pointer" onClick={() => navigate('alerts')}>
          <div className="flex items-center gap-1.5 mb-1">
            <BellIcon size={14} className="opacity-80" />
            <span className="text-xs opacity-80">{t('home.alerts')}</span>
          </div>
          <div className="text-xl font-black">{unreadCount}</div>
          <div className="text-[11px] opacity-70 mt-0.5">unread alerts</div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="mt-3 bg-white/15 rounded-[14px] p-3">
        <p className="text-xs opacity-70 mb-1">⚡ {t('home.recommendedAction')}</p>
        <p className="text-sm font-semibold">Sell Paddy now — prices at 3-week high. Best mandi: Chengalpattu APMC</p>
        <button onClick={() => navigate('smart-sell')} className="mt-2 text-xs bg-white/20 px-3 py-1.5 rounded-[8px] font-semibold hover:bg-white/30 transition-colors">
          {t('nav.smartSell')} →
        </button>
      </div>
    </div>
  );
}
