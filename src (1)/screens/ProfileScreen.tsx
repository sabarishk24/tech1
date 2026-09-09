import { useState } from 'react';
import { useApp } from '../context';
import { Badge, Button, Card, ChevronRightIcon, ProgressBar, ShieldIcon } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

export default function ProfileScreen() {
  const { t, user, farmProfile, logout, navigate, back, showToast, language, setLanguage } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [displayPhone, setDisplayPhone] = useState(user?.phone ?? '');

  const completeness = farmProfile
    ? [farmProfile.district, farmProfile.soilType, farmProfile.crops.length > 0, farmProfile.irrigationType, farmProfile.landSize > 0]
      .filter(Boolean).length * 20
    : 0;

  const profileItems = [
    { label: 'District', value: farmProfile?.district ?? 'Not set', icon: '📍' },
    { label: 'Land Size', value: farmProfile?.landSize ? `${farmProfile.landSize} acres` : 'Not set', icon: '🌾' },
    { label: 'Soil Type', value: farmProfile?.soilType || 'Not set', icon: '🌍' },
    { label: 'Irrigation', value: farmProfile?.irrigationType || 'Not set', icon: '💧' },
    { label: 'Crops', value: farmProfile?.crops?.join(', ') || 'Not set', icon: '🌿' },
  ];

  const menuItems = [
    { label: t('nav.farm'), icon: '🌾', screen: 'farm-profile' as const },
    { label: t('nav.alerts'), icon: '🔔', screen: 'alerts' as const },
    { label: t('nav.schemes'), icon: '📋', screen: 'schemes' as const },
    { label: t('nav.provider'), icon: '🏪', screen: 'provider' as const },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('profile.title')} back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {/* User card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[18px] bg-primary flex items-center justify-center text-white font-black text-2xl">
              {displayName[0] ?? 'A'}
            </div>
            <div className="flex-1">
              {editMode ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-lg font-black text-text border-b-2 border-primary bg-transparent focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-black text-text">{displayName}</h2>
              )}
              {editMode ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={13}
                  className="w-full text-sm text-muted border-b-2 border-primary bg-transparent focus:outline-none mt-0.5"
                />
              ) : (
                <p className="text-sm text-muted mt-0.5">{displayPhone}</p>
              )}
              <div className="flex gap-2 mt-1">
                <Badge variant="green">{t('profile.farmer')}</Badge>
                {farmProfile?.isComplete ? <Badge variant="teal">Profile Complete</Badge> : <Badge variant="amber">{t('farm.incomplete')}</Badge>}
              </div>
            </div>
          </div>

          {editMode ? (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setName(displayName); setPhone(displayPhone); setEditMode(false); }}>{t('common.cancel')}</Button>
              <Button className="flex-1" onClick={() => { setDisplayName(name); setDisplayPhone(phone); setEditMode(false); showToast('Profile updated', 'success'); }}>{t('common.save')}</Button>
            </div>
          ) : (
            <button onClick={() => setEditMode(true)} className="mt-4 w-full py-2 border border-border rounded-[12px] text-sm font-semibold text-muted hover:bg-surface-2 transition-colors">
              ✏️ {t('profile.edit')}
            </button>
          )}
        </Card>

        {/* Profile completeness */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-text text-sm">{t('profile.completeness')}</span>
            <span className="text-sm font-black text-primary">{completeness}%</span>
          </div>
          <ProgressBar value={completeness} max={100} />
          {completeness < 100 && (
            <button onClick={() => navigate('farm-profile')} className="mt-2 text-xs text-primary font-semibold">
              Complete your farm profile →
            </button>
          )}
        </Card>

        {/* Farm Profile details */}
        <Card>
          <h3 className="font-bold text-text mb-3">{t('profile.farmProfile')}</h3>
          <div className="flex flex-col gap-2">
            {profileItems.map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-text">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('farm-profile')} className="mt-3 w-full py-2 border border-primary/30 text-primary text-sm font-semibold rounded-[12px] hover:bg-green-50 transition-colors">
            Update Farm Profile →
          </button>
        </Card>

        {/* Language */}
        <Card>
          <h3 className="font-bold text-text mb-3">Language</h3>
          <div className="grid grid-cols-3 gap-2">
            {([['en', 'English', 'Aa'], ['ta', 'தமிழ்', 'அ'], ['hi', 'हिंदी', 'अ']] as const).map(([code, label, script]) => (
              <button key={code} onClick={() => setLanguage(code)}
                className={`flex flex-col items-center gap-1 p-3 rounded-[12px] border-2 transition-all ${language === code ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}>
                <span className={`text-xl font-black ${language === code ? 'text-primary' : 'text-text'}`}>{script}</span>
                <span className={`text-xs font-semibold ${language === code ? 'text-primary' : 'text-muted'}`}>{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick nav */}
        <Card padding="none">
          {menuItems.map((item, i) => (
            <button key={item.screen} onClick={() => navigate(item.screen)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 ${i < menuItems.length - 1 ? 'border-b border-border/50' : ''} hover:bg-surface-2 transition-colors text-left`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-semibold text-text flex-1">{item.label}</span>
              <ChevronRightIcon size={16} className="text-muted" />
            </button>
          ))}
        </Card>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
          }}
          className="w-full py-3.5 rounded-[14px] border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
        >
          {t('profile.logout')}
        </button>

        <p className="text-center text-xs text-muted">VALAM v1.0 · Built for farmers of India</p>
      </div>
    </div>
  );
}
