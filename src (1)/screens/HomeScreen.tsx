import { useState } from 'react';
import { useApp } from '../context';
import { PLANNER_TASKS } from '../data';
import { Badge, Card, TrendUpIcon, WeatherIcon, BellIcon } from '../components/ui';
import { Screen } from '../types';

interface Task { id: string; title: string; due: string; done: boolean; priority: string }

export default function HomeScreen() {
  const { t, farmProfile, navigate, unreadCount, user, ledgerEntries } = useApp();
  const [tasks, setTasks] = useState<Task[]>(PLANNER_TASKS);
  const [plannerTab, setPlannerTab] = useState<'tasks' | 'ledger'>('tasks');

  const toggleTask = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const income = ledgerEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = ledgerEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const pendingTasks = tasks.filter(t => !t.done).length;

  const quickActions: { label: string; icon: string; screen: Screen; color: string }[] = [
    { label: t('nav.estimator'), icon: '🧮', screen: 'estimator', color: 'bg-green-50 text-green-700' },
    { label: t('nav.smartSell'), icon: '📊', screen: 'smart-sell', color: 'bg-teal-50 text-teal-700' },
    { label: t('nav.amenities'), icon: '🚜', screen: 'amenities', color: 'bg-amber-50 text-amber-700' },
    { label: t('nav.disease'), icon: '🔬', screen: 'disease', color: 'bg-red-50 text-red-700' },
    { label: t('nav.schemes'), icon: '📋', screen: 'schemes', color: 'bg-blue-50 text-blue-700' },
    { label: t('nav.ledger'), icon: '📒', screen: 'ledger', color: 'bg-purple-50 text-purple-700' },
  ];

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
        <StatusCard t={t} unreadCount={unreadCount} navigate={navigate} />
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

      {/* Planner / Ledger snapshot */}
      <div className="px-4">
        <div className="flex bg-surface-2 rounded-[14px] p-1 mb-3">
          <button onClick={() => setPlannerTab('tasks')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${plannerTab === 'tasks' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            {t('home.planner')} {pendingTasks > 0 && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingTasks}</span>}
          </button>
          <button onClick={() => setPlannerTab('ledger')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${plannerTab === 'ledger' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            {t('home.ledger')}
          </button>
        </div>

        {plannerTab === 'tasks' ? (
          <Card padding="none">
            {tasks.map((task, i) => (
              <div key={task.id} className={`flex items-center gap-3 px-4 py-3 ${i < tasks.length - 1 ? 'border-b border-border/50' : ''}`}>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-primary border-primary' : 'border-border hover:border-primary'}`}
                >
                  {task.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.done ? 'line-through text-muted' : 'text-text'}`}>{task.title}</p>
                  <p className="text-xs text-muted">{task.due}</p>
                </div>
                {!task.done && <Badge variant={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'gray'}>{task.priority}</Badge>}
              </div>
            ))}
          </Card>
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

function StatusCard({ t, unreadCount, navigate }: { t: (k: string) => string; unreadCount: number; navigate: (s: Screen) => void }) {
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

        {/* Crop Health */}
        <div className="bg-white/10 rounded-[14px] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">🌱</span>
            <span className="text-xs opacity-80">{t('home.cropHealth')}</span>
          </div>
          <div className="text-xl font-black">Good</div>
          <div className="text-[11px] opacity-70 mt-0.5">Paddy Day 28 · Monitor for blast</div>
        </div>

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
