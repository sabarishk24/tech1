import { useState } from 'react';
import { useApp } from '../context';
import { TN_DISTRICTS } from '../data';
import { FarmProfile } from '../types';
import { Badge, Button, Card, CheckIcon, Spinner, Stepper } from '../components/ui';
import { ScreenHeader, WizardFooter } from '../components/Layout';

const SOIL_TYPES = ['Red Laterite', 'Black Cotton', 'Alluvial', 'Sandy Loam', 'Clay', 'Red Sandy', 'Saline/Alkaline'];
const LAND_TYPES = ['Irrigated', 'Rain-fed', 'Mixed'];
const CROP_LIST = ['Paddy', 'Groundnut', 'Maize', 'Sugarcane', 'Cotton', 'Turmeric', 'Pulses', 'Sunflower', 'Ragi', 'Sorghum', 'Sesame', 'Vegetables'];
const IRRIGATION = ['Borewell', 'Canal', 'Tank', 'Drip', 'Rain-fed', 'River'];

interface FormData {
  district: string;
  state: string;
  landSize: string;
  landType: string;
  soilType: string;
  crops: string[];
  irrigationType: string;
}

const STEPS = ['farm.step1', 'farm.step2', 'farm.step3', 'farm.step4', 'farm.step5'];

export default function FarmProfileScreen() {
  const { t, setFarmProfile, navigate, farmProfile, back, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    district: farmProfile?.district ?? '',
    state: farmProfile?.state ?? 'Tamil Nadu',
    landSize: farmProfile?.landSize?.toString() ?? '',
    landType: 'Irrigated',
    soilType: farmProfile?.soilType ?? '',
    crops: farmProfile?.crops ?? [],
    irrigationType: farmProfile?.irrigationType ?? '',
  });
  const [error, setError] = useState('');

  const update = (key: keyof FormData, value: string | string[]) => {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  };

  const handleGPS = async () => {
    setGpsLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setGpsLoading(false);
    update('district', 'Chengalpattu');
    update('state', 'Tamil Nadu');
    showToast('Location detected: Chengalpattu, Tamil Nadu', 'success');
  };

  const toggleCrop = (crop: string) => {
    const crops = form.crops.includes(crop)
      ? form.crops.filter(c => c !== crop)
      : [...form.crops, crop];
    update('crops', crops);
  };

  const validate = (): boolean => {
    if (step === 0 && !form.district) { setError('Please select your district'); return false; }
    if (step === 1 && (!form.landSize || isNaN(Number(form.landSize)))) { setError('Enter valid land size'); return false; }
    if (step === 2 && !form.soilType) { setError('Please select soil type'); return false; }
    if (step === 4 && !form.irrigationType) { setError('Please select irrigation type'); return false; }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }
    saveProfile(true);
  };

  const handleSkip = () => {
    if (step < 4) { setStep(s => s + 1); return; }
    saveProfile(false);
  };

  const saveProfile = (complete: boolean) => {
    const profile: FarmProfile = {
      district: form.district || 'Chengalpattu',
      state: form.state || 'Tamil Nadu',
      lat: 12.6819, lng: 79.9754,
      landSize: Number(form.landSize) || 0,
      soilType: form.soilType,
      crops: form.crops,
      irrigationType: form.irrigationType,
      isComplete: complete,
    };
    setFarmProfile(profile);
    if (!complete) showToast('Farm profile saved as Incomplete — you can finish it anytime', 'info');
    navigate('home');
  };

  const stepLabels = STEPS.map(k => t(k));

  return (
    <div className="min-h-full bg-background flex flex-col">
      <ScreenHeader
        title={t('farm.title')}
        subtitle={t('farm.subtitle')}
        back={() => back()}
      />

      {/* Stepper */}
      <div className="px-4 pb-4">
        <Stepper steps={stepLabels} current={step} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {step === 0 && <StepLocation form={form} gpsLoading={gpsLoading} onGPS={handleGPS} onUpdate={update} t={t} />}
        {step === 1 && <StepLand form={form} onUpdate={update} t={t} />}
        {step === 2 && <StepSoil form={form} onUpdate={update} t={t} />}
        {step === 3 && <StepCrops form={form} onToggle={toggleCrop} t={t} />}
        {step === 4 && <StepIrrigation form={form} onUpdate={update} t={t} />}

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        {/* Why this matters */}
        <Card className="mt-4 bg-green-50 border-green-100" padding="sm">
          <p className="text-xs text-green-800 font-medium">{t('farm.completedNote')}</p>
        </Card>
      </div>

      <WizardFooter
        onBack={step > 0 ? () => setStep(s => s - 1) : undefined}
        onContinue={handleContinue}
        onSkip={handleSkip}
        skipLabel={t('farm.skip')}
      />
    </div>
  );
}

function StepLocation({ form, gpsLoading, onGPS, onUpdate, t }: {
  form: FormData; gpsLoading: boolean; onGPS: () => void;
  onUpdate: (k: keyof FormData, v: string | string[]) => void; t: (k: string) => string;
}) {
  const [search, setSearch] = useState('');
  const filtered = TN_DISTRICTS.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={onGPS} variant="outline" icon={gpsLoading ? <Spinner size={16} /> : <span>📍</span>} loading={gpsLoading}>
        {gpsLoading ? t('farm.detecting') : t('farm.detectGPS')}
      </Button>

      {form.district && (
        <Card className="bg-green-50 border-green-200 flex items-center gap-3" padding="sm">
          <span className="text-green-600">✓</span>
          <span className="text-sm font-semibold text-green-800">{form.district}, {form.state}</span>
        </Card>
      )}

      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('farm.district')}</label>
        <input
          type="text"
          placeholder="Search district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-2"
        />
        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
          {filtered.map(d => (
            <button
              key={d}
              onClick={() => onUpdate('district', d)}
              className={`text-left px-3 py-2.5 rounded-[12px] text-sm transition-all ${form.district === d ? 'bg-primary text-white font-semibold' : 'bg-white border border-border hover:border-primary/40'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepLand({ form, onUpdate, t }: {
  form: FormData; onUpdate: (k: keyof FormData, v: string | string[]) => void; t: (k: string) => string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('farm.landSize')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="e.g. 3"
            value={form.landSize}
            onChange={e => onUpdate('landSize', e.target.value)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            min="0.1" step="0.5"
          />
          <div className="flex items-center px-4 py-2.5 rounded-[14px] bg-surface-2 text-sm text-muted font-medium">acres</div>
        </div>
        <div className="flex gap-2 mt-2">
          {['1', '2', '3', '5', '10'].map(v => (
            <button key={v} onClick={() => onUpdate('landSize', v)}
              className={`px-3 py-1.5 rounded-[10px] text-sm font-medium border transition-all ${form.landSize === v ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/40'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('farm.landType')}</label>
        <div className="grid grid-cols-3 gap-2">
          {LAND_TYPES.map(lt => (
            <button key={lt} onClick={() => onUpdate('landType', lt)}
              className={`py-3 rounded-[14px] text-sm font-medium border-2 transition-all ${form.landType === lt ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-text hover:border-primary/40'}`}>
              {lt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSoil({ form, onUpdate, t }: {
  form: FormData; onUpdate: (k: keyof FormData, v: string | string[]) => void; t: (k: string) => string;
}) {
  const icons: Record<string, string> = {
    'Red Laterite': '🔴', 'Black Cotton': '⚫', 'Alluvial': '🟤',
    'Sandy Loam': '🟡', 'Clay': '🟠', 'Red Sandy': '🔶', 'Saline/Alkaline': '🔵',
  };
  return (
    <div>
      <label className="text-sm font-semibold text-text block mb-3">{t('farm.soil')}</label>
      <div className="grid grid-cols-2 gap-2">
        {SOIL_TYPES.map(st => (
          <button
            key={st}
            onClick={() => onUpdate('soilType', st)}
            className={`flex items-center gap-3 p-3.5 rounded-[14px] text-left border-2 transition-all ${form.soilType === st ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/40'}`}
          >
            <span className="text-xl">{icons[st]}</span>
            <span className={`text-sm font-medium ${form.soilType === st ? 'text-primary' : 'text-text'}`}>{st}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepCrops({ form, onToggle, t }: {
  form: FormData; onToggle: (crop: string) => void; t: (k: string) => string;
}) {
  const icons: Record<string, string> = {
    Paddy: '🌾', Groundnut: '🥜', Maize: '🌽', Sugarcane: '🎋',
    Cotton: '☁️', Turmeric: '🟡', Pulses: '🫘', Sunflower: '🌻',
    Ragi: '🌿', Sorghum: '🌱', Sesame: '✨', Vegetables: '🥦',
  };
  return (
    <div>
      <label className="text-sm font-semibold text-text block mb-3">{t('farm.crops')}</label>
      <div className="grid grid-cols-3 gap-2">
        {CROP_LIST.map(crop => {
          const selected = form.crops.includes(crop);
          return (
            <button
              key={crop}
              onClick={() => onToggle(crop)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-[14px] border-2 transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/40'}`}
            >
              <span className="text-2xl">{icons[crop]}</span>
              <span className={`text-xs font-medium text-center leading-tight ${selected ? 'text-primary' : 'text-text'}`}>{crop}</span>
              {selected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <CheckIcon size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {form.crops.map(c => <Badge key={c} variant="green">{c}</Badge>)}
      </div>
    </div>
  );
}

function StepIrrigation({ form, onUpdate, t }: {
  form: FormData; onUpdate: (k: keyof FormData, v: string | string[]) => void; t: (k: string) => string;
}) {
  const icons: Record<string, string> = {
    Borewell: '💧', Canal: '🌊', Tank: '🏞️', Drip: '💦', 'Rain-fed': '🌧️', River: '🏔️',
  };
  return (
    <div>
      <label className="text-sm font-semibold text-text block mb-3">{t('farm.irrigation')}</label>
      <div className="grid grid-cols-2 gap-3">
        {IRRIGATION.map(irr => (
          <button
            key={irr}
            onClick={() => onUpdate('irrigationType', irr)}
            className={`flex items-center gap-3 p-4 rounded-[16px] border-2 transition-all ${form.irrigationType === irr ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/40'}`}
          >
            <span className="text-2xl">{icons[irr]}</span>
            <span className={`text-sm font-semibold ${form.irrigationType === irr ? 'text-primary' : 'text-text'}`}>{irr}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
