import { useState } from 'react';
import { useApp } from '../context';
import { DISTRICT_PRICES, MANDIS, TN_DISTRICTS } from '../data';
import { Mandi } from '../types';
import {
  Badge, Button, Card, PhoneIcon, SearchIcon, Sparkline,
  Spinner, Stepper, TrendDownIcon, TrendUpIcon,
} from '../components/ui';
import { ScreenHeader, WizardFooter } from '../components/Layout';

const CROPS = ['Paddy', 'Groundnut', 'Maize', 'Turmeric', 'Cotton', 'Sunflower'];
const STEP_KEYS = ['smartSell.step1', 'smartSell.step2', 'smartSell.step3', 'smartSell.step4'];

export default function SmartSellScreen() {
  const { t, farmProfile, back, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState(farmProfile?.crops?.[0] ?? 'Paddy');
  const [quantity, setQuantity] = useState('30');
  const [quality, setQuality] = useState('A');
  const [selectedDistrict, setSelectedDistrict] = useState(farmProfile?.district ?? 'Chengalpattu');
  const [selectedMandi, setSelectedMandi] = useState<Mandi | null>(null);
  const [districtSearch, setDistrictSearch] = useState('');
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [showWait, setShowWait] = useState(false);
  const [waitWeeks, setWaitWeeks] = useState(2);
  const [showPool, setShowPool] = useState(false);

  const steps = STEP_KEYS.map(k => t(k));
  const mandis = MANDIS[selectedDistrict] ?? Object.values(MANDIS).flat().slice(0, 3);
  const allDistricts = TN_DISTRICTS.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));

  const handleFindMarkets = async () => {
    setLoadingMarkets(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoadingMarkets(false);
    setStep(2);
  };

  const handleSell = () => {
    showToast(`${t('smartSell.soldConfirm')} ${quantity} quintals of ${crop}`, 'success');
    setStep(0);
    setCrop(farmProfile?.crops?.[0] ?? 'Paddy');
    setQuantity('30');
  };

  const handleStore = () => {
    showToast(t('smartSell.storeConfirm'), 'success');
    setShowWait(false);
  };

  const bestMandi = mandis.find(m => m.isBestMatch) ?? mandis[0];
  const storageCostPerWeek = 25;
  const expectedPriceGain = selectedMandi ? selectedMandi.price * 0.04 * waitWeeks : 0;
  const storageCost = Number(quantity) * storageCostPerWeek * waitWeeks;
  const netGain = (expectedPriceGain * Number(quantity)) - storageCost;

  const currentDistrictPrice = DISTRICT_PRICES[selectedDistrict] ?? 2100;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('smartSell.title')} back={back} />
      <div className="px-4 pb-4">
        <Stepper steps={steps} current={step} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {step === 0 && (
          <Step1Setup crop={crop} quantity={quantity} quality={quality}
            setCrop={setCrop} setQuantity={setQuantity} setQuality={setQuality} t={t}
            onFind={handleFindMarkets} loading={loadingMarkets} />
        )}
        {step === 1 && (
          <Step2District
            selected={selectedDistrict} search={districtSearch} setSearch={setDistrictSearch}
            districts={allDistricts} prices={DISTRICT_PRICES}
            onSelect={(d) => { setSelectedDistrict(d); setDistrictSearch(''); }}
            t={t} crop={crop}
          />
        )}
        {step === 2 && (
          <Step3Markets mandis={mandis} onSelect={(m) => { setSelectedMandi(m); setStep(3); }} t={t} crop={crop} />
        )}
        {step === 3 && selectedMandi && (
          <Step4Detail
            mandi={selectedMandi} quantity={Number(quantity)} t={t}
            showWait={showWait} setShowWait={setShowWait}
            waitWeeks={waitWeeks} setWaitWeeks={setWaitWeeks}
            storageCost={storageCost} netGain={netGain}
            onSell={handleSell} onStore={handleStore}
            showPool={showPool} setShowPool={setShowPool}
          />
        )}
      </div>

      {step === 1 && (
        <WizardFooter
          onBack={() => setStep(0)}
          onContinue={() => handleFindMarkets()}
          continueLabel={t('smartSell.findMarkets')}
        />
      )}
    </div>
  );
}

function Step1Setup({ crop, quantity, quality, setCrop, setQuantity, setQuality, t, onFind, loading }: {
  crop: string; quantity: string; quality: string;
  setCrop: (v: string) => void; setQuantity: (v: string) => void; setQuality: (v: string) => void;
  t: (k: string) => string; onFind: () => void; loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-text block mb-2">{t('smartSell.selectCrop')}</label>
        <div className="grid grid-cols-3 gap-2">
          {CROPS.map(c => (
            <button key={c} onClick={() => setCrop(c)}
              className={`py-2.5 px-3 rounded-[12px] text-sm font-semibold border-2 transition-all ${crop === c ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-text'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('smartSell.quantity')}</label>
        <div className="flex gap-2">
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <div className="flex items-center px-4 bg-surface-2 rounded-[14px] text-sm text-muted font-medium">qtl</div>
        </div>
        <div className="flex gap-2 mt-2">
          {['10', '20', '30', '50', '100'].map(v => (
            <button key={v} onClick={() => setQuantity(v)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-all ${quantity === v ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-text block mb-2">{t('smartSell.quality')}</label>
        <div className="grid grid-cols-3 gap-2">
          {[['A', t('smartSell.gradeA'), '+8%'], ['B', t('smartSell.gradeB'), 'Base'], ['C', t('smartSell.gradeC'), '-5%']].map(([v, label, premium]) => (
            <button key={v} onClick={() => setQuality(v)}
              className={`flex flex-col items-center p-3 rounded-[12px] border-2 transition-all ${quality === v ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}>
              <span className={`font-black text-xl mb-0.5 ${quality === v ? 'text-primary' : 'text-text'}`}>{v}</span>
              <span className="text-[10px] text-muted text-center leading-tight">{label}</span>
              <span className="text-[10px] font-semibold text-green-600">{premium}</span>
            </button>
          ))}
        </div>
      </div>
      <Button fullWidth loading={loading} onClick={onFind} size="lg">
        {loading ? <><Spinner size={16} /> Finding best markets...</> : t('smartSell.findMarkets')}
      </Button>
      <button onClick={() => {}} className="text-sm text-primary font-semibold text-center">
        → {t('smartSell.selectDistrict')} first
      </button>
    </div>
  );
}

function Step2District({ selected, search, setSearch, districts, prices, onSelect, t, crop }: {
  selected: string; search: string; setSearch: (v: string) => void;
  districts: string[]; prices: Record<string, number>;
  onSelect: (d: string) => void; t: (k: string) => string; crop: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Select market district for <span className="font-semibold text-text">{crop}</span>. Prices vary by district.</p>
      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={t('smartSell.districtSearch')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[44px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {districts.map(d => {
          const price = prices[d];
          const isSelected = d === selected;
          return (
            <button key={d} onClick={() => onSelect(d)}
              className={`flex items-center justify-between p-3 rounded-[12px] border-2 transition-all text-left ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/40'}`}>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-text'}`}>{d}</p>
                {price && <p className="text-xs text-green-600 font-semibold">₹{price.toLocaleString()}/qtl</p>}
              </div>
              {isSelected && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg></div>}
            </button>
          );
        })}
      </div>
      {selected && (
        <Card className="bg-green-50 border-green-200" padding="sm">
          <p className="text-sm text-green-800 font-semibold">Selected: {selected}</p>
          <p className="text-xs text-green-600">Current paddy price: ₹{(DISTRICT_PRICES[selected] ?? 2100).toLocaleString()}/quintal</p>
        </Card>
      )}
    </div>
  );
}

function Step3Markets({ mandis, onSelect, t, crop }: {
  mandis: Mandi[]; onSelect: (m: Mandi) => void; t: (k: string) => string; crop: string;
}) {
  const [sortBy, setSortBy] = useState<'price' | 'profit' | 'distance'>('profit');
  const sorted = [...mandis].sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'profit') return b.netProfit - a.netProfit;
    return a.distance - b.distance;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{mandis.length} mandis found for <span className="font-semibold text-text">{crop}</span></p>
        <div className="flex gap-1">
          {(['profit', 'price', 'distance'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold border transition-all ${sortBy === s ? 'bg-primary text-white border-primary' : 'border-border text-text bg-white'}`}>
              {s === 'profit' ? 'Net Profit' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {sorted.map(mandi => (
        <MandiCard key={mandi.id} mandi={mandi} onSelect={() => onSelect(mandi)} t={t} />
      ))}
    </div>
  );
}

function MandiCard({ mandi, onSelect, t }: { mandi: Mandi; onSelect: () => void; t: (k: string) => string }) {
  return (
    <Card onClick={onSelect} className={mandi.isBestMatch ? 'border-2 border-primary' : ''}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text">{mandi.name}</span>
            {mandi.isBestMatch && <Badge variant="green">⭐ {t('smartSell.bestMatch')}</Badge>}
          </div>
          <p className="text-xs text-muted mt-0.5">{mandi.district} · {mandi.distance} km away</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-surface-2 rounded-[10px] p-2 text-center">
              <p className="text-[10px] text-muted">Price</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold text-text">₹{mandi.price.toLocaleString()}</p>
                {mandi.trend === 'up' ? <TrendUpIcon size={12} className="text-green-500" /> : mandi.trend === 'down' ? <TrendDownIcon size={12} className="text-red-500" /> : null}
              </div>
            </div>
            <div className="bg-surface-2 rounded-[10px] p-2 text-center">
              <p className="text-[10px] text-muted">Commission</p>
              <p className="text-sm font-bold text-text">{mandi.commission}%</p>
            </div>
            <div className="bg-primary/10 rounded-[10px] p-2 text-center">
              <p className="text-[10px] text-primary">{t('smartSell.netProfit')}</p>
              <p className="text-sm font-bold text-primary">₹{mandi.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <Sparkline data={mandi.priceHistory.map(h => h.price)} width={60} height={30} color={mandi.trend === 'up' ? '#2E7D32' : '#DC2626'} />
      </div>
    </Card>
  );
}

function Step4Detail({ mandi, quantity, t, showWait, setShowWait, waitWeeks, setWaitWeeks, storageCost, netGain, onSell, onStore, showPool, setShowPool }: {
  mandi: Mandi; quantity: number; t: (k: string) => string;
  showWait: boolean; setShowWait: (v: boolean) => void;
  waitWeeks: number; setWaitWeeks: (v: number) => void;
  storageCost: number; netGain: number;
  onSell: () => void; onStore: () => void;
  showPool: boolean; setShowPool: (v: boolean) => void;
}) {
  const totalGross = mandi.price * quantity;
  const commission = Math.round(totalGross * mandi.commission / 100);
  const transport = mandi.transportCost * quantity;
  const netTotal = totalGross - commission - transport;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-text">{mandi.name}</h2>
            <p className="text-xs text-muted">{mandi.district} · {mandi.distance} km</p>
          </div>
          {mandi.isBestMatch && <Badge variant="green">Best Match</Badge>}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl font-black text-text">₹{mandi.price.toLocaleString()}</div>
          <div className="text-xs text-muted">/ quintal</div>
          <div className="flex items-center gap-1 ml-auto">
            {mandi.trend === 'up' ? <TrendUpIcon size={16} className="text-green-500" /> : <TrendDownIcon size={16} className="text-red-500" />}
            <span className={`text-xs font-semibold ${mandi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {mandi.trend === 'up' ? '+2.4%' : '-1.2%'} (7d)
            </span>
          </div>
        </div>
        {/* Sparkline */}
        <div className="bg-surface-2 rounded-[12px] p-3 mb-4">
          <p className="text-xs text-muted mb-2">{t('smartSell.trend7d')}</p>
          <div className="flex items-end gap-2">
            <Sparkline data={mandi.priceHistory.map(h => h.price)} width={220} height={50} color={mandi.trend === 'up' ? '#2E7D32' : '#DC2626'} />
            <div className="text-right">
              {mandi.priceHistory.map(h => (
                <div key={h.date} className="text-[10px] text-muted">{h.date}: ₹{h.price}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Profit Table */}
        <h3 className="text-sm font-bold text-text mb-2">Net Profit Breakdown ({quantity} qtl)</h3>
        <div className="bg-surface-2 rounded-[14px] overflow-hidden">
          {[
            { label: t('smartSell.grossPrice'), value: `₹${totalGross.toLocaleString()}`, highlight: false },
            { label: `${t('smartSell.commission')} (${mandi.commission}%)`, value: `-₹${commission.toLocaleString()}`, highlight: false, negative: true },
            { label: t('smartSell.transport'), value: `-₹${transport.toLocaleString()}`, highlight: false, negative: true },
          ].map((r, i) => (
            <div key={i} className="flex justify-between px-4 py-2.5 border-b border-border/50 text-sm">
              <span className="text-muted">{r.label}</span>
              <span className={r.negative ? 'font-semibold text-red-500' : 'font-semibold text-text'}>{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 bg-primary/10">
            <span className="font-bold text-primary">{t('smartSell.netProfit')}</span>
            <span className="font-black text-primary text-lg">₹{netTotal.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Facilities */}
      <Card padding="sm">
        <p className="text-xs font-bold text-text mb-2">{t('smartSell.facilities')}</p>
        <div className="flex flex-wrap gap-2">
          {mandi.facilities.map(f => <Badge key={f} variant="teal">{f}</Badge>)}
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-muted">
          <PhoneIcon size={14} />
          <a href={`tel:${mandi.contact}`} className="text-primary font-semibold">{mandi.contact}</a>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onSell} size="lg" className="flex-col h-auto py-4">
          <span className="text-xl mb-1">💰</span>
          {t('smartSell.sellNow')}
        </Button>
        <button
          onClick={() => setShowWait(!showWait)}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-[14px] border-2 border-teal text-teal font-bold text-sm bg-teal/5 hover:bg-teal/10 transition-all"
        >
          <span className="text-xl">⏳</span>
          {t('smartSell.wait')}
        </button>
      </div>

      {/* Wait calculator */}
      {showWait && (
        <Card className="bg-teal/5 border-teal/30">
          <h3 className="text-sm font-bold text-teal mb-3">Storage & Wait Analysis</h3>
          <div className="mb-3">
            <label className="text-xs font-semibold text-text block mb-1.5">{t('smartSell.waitWeeks')}: {waitWeeks}</label>
            <input type="range" min={1} max={8} value={waitWeeks} onChange={e => setWaitWeeks(Number(e.target.value))}
              className="w-full accent-teal" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded-[12px] p-3">
              <p className="text-xs text-muted">{t('smartSell.storageCost')}</p>
              <p className="font-bold text-red-500">₹{storageCost.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-[12px] p-3">
              <p className="text-xs text-muted">{t('smartSell.projectedProfit')}</p>
              <p className={`font-bold ${netGain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {netGain >= 0 ? '+' : ''}₹{Math.abs(netGain).toLocaleString()}
              </p>
            </div>
          </div>
          <Button onClick={onStore} variant="secondary" fullWidth className="mt-3">
            Confirm {waitWeeks}-week Storage
          </Button>
        </Card>
      )}

      {/* Buyer Pool */}
      <button onClick={() => setShowPool(!showPool)}
        className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-[16px] text-left">
        <span className="text-2xl">👥</span>
        <div>
          <p className="text-sm font-bold text-purple-700">{t('smartSell.pools')}</p>
          <p className="text-xs text-purple-500">{t('smartSell.poolDesc')}</p>
        </div>
      </button>
      {showPool && (
        <Card>
          <h3 className="text-sm font-bold text-text mb-3">Active Buyer Pool</h3>
          {[
            { name: 'S.K. Rice Mill', qty: '120 qtl', price: '₹2,200', joined: 4 },
            { name: 'Vel Traders', qty: '200 qtl', price: '₹2,180', joined: 7 },
          ].map(pool => (
            <div key={pool.name} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-text">{pool.name}</p>
                <p className="text-xs text-muted">Needs {pool.qty} · Offering {pool.price}</p>
                <p className="text-xs text-primary">{pool.joined} farmers joined</p>
              </div>
              <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-[8px]">Join</button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
