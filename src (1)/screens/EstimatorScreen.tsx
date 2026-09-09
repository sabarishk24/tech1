import { useEffect, useState } from 'react';
import { useApp } from '../context';
import { CROP_RECOMMENDATIONS } from '../data';
import { CropRecommendation } from '../types';
import {
  Badge, Button, Card, CheckIcon, DownloadIcon, FilterIcon,
  InfoIcon, LockIcon, ProgressBar, ScoreRing, Skeleton, Spinner, Stepper,
} from '../components/ui';
import { ScreenHeader, WizardFooter } from '../components/Layout';

const STEP_KEYS = ['estimator.step1', 'estimator.step2', 'estimator.step3', 'estimator.step4', 'estimator.step5', 'estimator.step6'];

type SortKey = 'score' | 'revenue' | 'duration' | 'risk';
type FilterRisk = 'all' | 'low' | 'medium' | 'high';
type FilterWater = 'all' | 'low' | 'medium' | 'high';

export default function EstimatorScreen() {
  const { t, farmProfile, pdfDownloads, incrementPdfDownloads, back, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [season, setSeason] = useState('kharif');
  const [budget, setBudget] = useState('25000');
  const [area, setArea] = useState(farmProfile?.landSize?.toString() ?? '3');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [riskFilter, setRiskFilter] = useState<FilterRisk>('all');
  const [waterFilter, setWaterFilter] = useState<FilterWater>('all');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showSoilTest, setShowSoilTest] = useState(false);

  const steps = STEP_KEYS.map(k => t(k));

  const ANALYSIS_STEPS = [
    'Soil profile analyzed',
    'Weather data fetched',
    'Market prices updated',
    `${CROP_RECOMMENDATIONS.length} crops evaluated`,
    'Recommendations generated',
  ];

  useEffect(() => {
    if (step !== 2) return;
    setAnalysisStep(0);
    const interval = setInterval(() => {
      setAnalysisStep(n => {
        if (n >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setStep(3), 600);
          return n;
        }
        return n + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [step]);

  const filtered = CROP_RECOMMENDATIONS
    .filter(c => riskFilter === 'all' || c.riskLevel === riskFilter)
    .filter(c => waterFilter === 'all' || c.waterRequirement === waterFilter)
    .sort((a, b) => {
      if (sortBy === 'score') return b.suitabilityScore - a.suitabilityScore;
      if (sortBy === 'revenue') return b.estimatedRevenue - a.estimatedRevenue;
      if (sortBy === 'duration') return a.duration - b.duration;
      if (sortBy === 'risk') return ['low', 'medium', 'high'].indexOf(a.riskLevel) - ['low', 'medium', 'high'].indexOf(b.riskLevel);
      return 0;
    });

  const compareItems = CROP_RECOMMENDATIONS.filter(c => compareList.includes(c.id));

  const toggleCompare = (id: string) => {
    setCompareList(l => {
      if (l.includes(id)) return l.filter(x => x !== id);
      if (l.length >= 3) { showToast(t('estimator.maxCompare'), 'info'); return l; }
      return [...l, id];
    });
  };

  const handleDownloadPDF = async () => {
    if (pdfDownloads >= 3) { showToast(t('estimator.pdfCap'), 'error'); return; }
    setPdfLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setPdfLoading(false);
    incrementPdfDownloads();
    showToast(t('estimator.downloaded'), 'success');
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('estimator.title')} back={back} />
      <div className="px-4 pb-4">
        <Stepper steps={steps} current={step} />
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {step === 0 && <Step1Inputs season={season} budget={budget} area={area} setSeason={setSeason} setBudget={setBudget} setArea={setArea} t={t} farmProfile={farmProfile} />}
        {step === 1 && <Step2Review t={t} farmProfile={farmProfile} />}
        {step === 2 && <Step3Analysis steps={ANALYSIS_STEPS} current={analysisStep} t={t} />}
        {step === 3 && (
          <Step4Recommendations
            crops={filtered}
            compareList={compareList}
            onCompare={toggleCompare}
            sortBy={sortBy}
            setSortBy={setSortBy}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
            waterFilter={waterFilter}
            setWaterFilter={setWaterFilter}
            t={t}
          />
        )}
        {step === 4 && (
          <Step5Compare items={compareItems} onRemove={id => toggleCompare(id)} t={t} showSoilTest={showSoilTest} setShowSoilTest={setShowSoilTest} />
        )}
        {step === 5 && (
          <Step6Report
            items={compareItems}
            pdfDownloads={pdfDownloads}
            pdfLoading={pdfLoading}
            onDownload={handleDownloadPDF}
            t={t}
          />
        )}
      </div>

      {step !== 2 && (
        <WizardFooter
          onBack={step > 0 ? () => setStep(s => s - 1) : undefined}
          onContinue={step < 5 ? () => setStep(s => s + 1) : undefined}
          continueLabel={step === 3 && compareList.length === 0 ? 'Skip Compare →' : step === 4 ? 'Generate Report' : undefined}
          disabled={step === 3 && compareList.length === 0}
        />
      )}
    </div>
  );
}

function Step1Inputs({ season, budget, area, setSeason, setBudget, setArea, t, farmProfile }: {
  season: string; budget: string; area: string;
  setSeason: (v: string) => void; setBudget: (v: string) => void; setArea: (v: string) => void;
  t: (k: string) => string; farmProfile: { landSize: number } | null;
}) {
  const seasons = [
    { key: 'kharif', label: t('estimator.kharif'), icon: '🌧️' },
    { key: 'rabi', label: t('estimator.rabi'), icon: '☀️' },
    { key: 'zaid', label: t('estimator.zaid'), icon: '🌱' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-text block mb-2">{t('estimator.season')}</label>
        <div className="grid grid-cols-3 gap-2">
          {seasons.map(s => (
            <button key={s.key} onClick={() => setSeason(s.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-[14px] border-2 transition-all ${season === s.key ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}>
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-xs font-semibold text-center ${season === s.key ? 'text-primary' : 'text-text'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('estimator.area')}</label>
        <div className="flex gap-2">
          <input type="number" value={area} onChange={e => setArea(e.target.value)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <div className="flex items-center px-4 bg-surface-2 rounded-[14px] text-sm text-muted font-medium">acres</div>
        </div>
        {farmProfile?.landSize && (
          <button onClick={() => setArea(farmProfile.landSize.toString())} className="text-xs text-primary mt-1 font-medium">
            Use farm size: {farmProfile.landSize} acres
          </button>
        )}
      </div>
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('estimator.budget')}</label>
        <div className="flex gap-2">
          <div className="flex items-center px-4 bg-surface-2 rounded-[14px] text-sm text-muted font-medium">₹</div>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {['15000', '25000', '40000', '60000'].map(v => (
            <button key={v} onClick={() => setBudget(v)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-all ${budget === v ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/40'}`}>
              ₹{(Number(v) / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2Review({ t, farmProfile }: { t: (k: string) => string; farmProfile: { soilType: string; district: string } | null }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌍</span>
          <span className="font-bold text-text">{t('estimator.soilReview')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Type', value: farmProfile?.soilType ?? 'Red Laterite' },
            { label: 'pH', value: '6.5 (Optimal)' },
            { label: 'Nitrogen', value: '185 kg/ha (Medium)' },
            { label: 'Phosphorus', value: '28 kg/ha (Low)' },
            { label: 'Potassium', value: '320 kg/ha (High)' },
            { label: 'Organic Matter', value: '0.8% (Low)' },
          ].map(r => (
            <div key={r.label} className="bg-surface-2 rounded-[12px] p-3">
              <p className="text-xs text-muted">{r.label}</p>
              <p className="text-sm font-semibold text-text mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌤️</span>
          <span className="font-bold text-text">{t('estimator.weatherReview')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Temperature', value: '32°C / 24°C' },
            { label: 'Humidity', value: '65%' },
            { label: 'Rainfall (Sep)', value: '120mm expected' },
            { label: 'Wind', value: '12 km/h NE' },
          ].map(r => (
            <div key={r.label} className="bg-surface-2 rounded-[12px] p-3">
              <p className="text-xs text-muted">{r.label}</p>
              <p className="text-sm font-semibold text-text mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Step3Analysis({ steps, current, t }: { steps: string[]; current: number; t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Spinner size={40} color="#2E7D32" />
      </div>
      <p className="text-base font-semibold text-text text-center">{t('estimator.analyzing')}</p>
      <div className="w-full max-w-sm flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < current ? 'bg-primary' : i === current ? 'bg-primary/20 border-2 border-primary animate-pulse' : 'bg-gray-100'}`}>
              {i < current && <CheckIcon size={14} className="text-white" />}
            </div>
            <p className={`text-sm transition-all ${i <= current ? 'text-text font-medium' : 'text-muted'}`}>{step}</p>
          </div>
        ))}
      </div>
      <ProgressBar value={current} max={steps.length - 1} className="w-full max-w-sm" />
    </div>
  );
}

function Step4Recommendations({ crops, compareList, onCompare, sortBy, setSortBy, riskFilter, setRiskFilter, waterFilter, setWaterFilter, t }: {
  crops: CropRecommendation[];
  compareList: string[];
  onCompare: (id: string) => void;
  sortBy: SortKey; setSortBy: (v: SortKey) => void;
  riskFilter: FilterRisk; setRiskFilter: (v: FilterRisk) => void;
  waterFilter: FilterWater; setWaterFilter: (v: FilterWater) => void;
  t: (k: string) => string;
}) {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted">{crops.length} {t('estimator.crops')}</span>
        <div className="flex-1" />
        <button onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-[10px] hover:bg-green-50">
          <FilterIcon size={14} /> {t('common.filter')}
        </button>
      </div>

      {showFilters && (
        <Card padding="sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold text-text mb-1.5">{t('estimator.sortBy')}</p>
              <div className="flex gap-2 flex-wrap">
                {(['score', 'revenue', 'duration', 'risk'] as SortKey[]).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-1 rounded-[8px] text-xs font-semibold border transition-all ${sortBy === s ? 'bg-primary text-white border-primary' : 'border-border text-text bg-white'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-text mb-1.5">{t('estimator.filterRisk')}</p>
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'low', 'medium', 'high'] as FilterRisk[]).map(r => (
                    <button key={r} onClick={() => setRiskFilter(r)}
                      className={`px-2.5 py-1 rounded-[8px] text-xs font-semibold border transition-all ${riskFilter === r ? 'bg-primary text-white border-primary' : 'border-border text-text bg-white'}`}>
                      {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-text mb-1.5">{t('estimator.filterWater')}</p>
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'low', 'medium', 'high'] as FilterWater[]).map(w => (
                    <button key={w} onClick={() => setWaterFilter(w)}
                      className={`px-2.5 py-1 rounded-[8px] text-xs font-semibold border transition-all ${waterFilter === w ? 'bg-primary text-white border-primary' : 'border-border text-text bg-white'}`}>
                      {w === 'all' ? 'All' : w.charAt(0).toUpperCase() + w.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {compareList.length > 0 && (
        <div className="bg-primary/10 rounded-[12px] p-2.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">{compareList.length}/3 selected for comparison</span>
        </div>
      )}

      {crops.map(crop => <CropCard key={crop.id} crop={crop} inCompare={compareList.includes(crop.id)} onCompare={() => onCompare(crop.id)} t={t} />)}
    </div>
  );
}

function CropCard({ crop, inCompare, onCompare, t }: { crop: CropRecommendation; inCompare: boolean; onCompare: () => void; t: (k: string) => string }) {
  const riskColors: Record<string, 'green' | 'amber' | 'red'> = { low: 'green', medium: 'amber', high: 'red' };
  const waterIcons: Record<string, string> = { low: '💧', medium: '💧💧', high: '💧💧💧' };
  return (
    <Card className={`transition-all ${inCompare ? 'border-2 border-primary' : ''}`}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-3xl">{crop.emoji}</span>
          <ScoreRing score={crop.suitabilityScore} size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-bold text-text">{crop.name}</span>
            <Badge variant={riskColors[crop.riskLevel]}>{crop.riskLevel} risk</Badge>
          </div>
          <p className="text-xs text-muted mt-0.5 mb-2">{crop.suitabilityReason}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted">{t('estimator.yield')}</span><span className="font-semibold">{crop.expectedYield}kg/ac</span></div>
            <div className="flex justify-between"><span className="text-muted">{t('estimator.revenue')}</span><span className="font-semibold text-primary">₹{(crop.estimatedRevenue / 1000).toFixed(1)}K</span></div>
            <div className="flex justify-between"><span className="text-muted">{t('estimator.water')}</span><span>{waterIcons[crop.waterRequirement]}</span></div>
            <div className="flex justify-between"><span className="text-muted">{t('estimator.duration')}</span><span className="font-semibold">{crop.duration}d</span></div>
          </div>
          <button
            onClick={onCompare}
            className={`mt-2 w-full py-1.5 rounded-[10px] text-xs font-bold border-2 transition-all ${inCompare ? 'bg-primary text-white border-primary' : 'border-primary text-primary hover:bg-primary/5'}`}
          >
            {inCompare ? '✓ ' + t('estimator.addCompare') : '+ ' + t('estimator.addCompare')}
          </button>
        </div>
      </div>
    </Card>
  );
}

function Step5Compare({ items, onRemove, t, showSoilTest, setShowSoilTest }: {
  items: CropRecommendation[];
  onRemove: (id: string) => void;
  t: (k: string) => string;
  showSoilTest: boolean;
  setShowSoilTest: (v: boolean) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">🌾</div>
        <p className="text-text font-semibold">No crops selected</p>
        <p className="text-sm text-muted">Go back to Recommendations and add up to 3 crops</p>
      </div>
    );
  }

  const rows: { label: string; key: keyof CropRecommendation; format?: (v: unknown) => string }[] = [
    { label: t('estimator.suitability'), key: 'suitabilityScore', format: v => `${v}/100` },
    { label: t('estimator.yield'), key: 'expectedYield', format: v => `${v} kg/ac` },
    { label: 'Price', key: 'marketPrice', format: v => `₹${v}/kg` },
    { label: t('estimator.revenue'), key: 'estimatedRevenue', format: v => `₹${(Number(v) / 1000).toFixed(1)}K/ac` },
    { label: t('estimator.water'), key: 'waterRequirement' },
    { label: t('estimator.duration'), key: 'duration', format: v => `${v} days` },
    { label: t('estimator.risk'), key: 'riskLevel' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-text">{t('estimator.compareTitle')}</h2>

      {/* Header row */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${items.length}, 1fr)` }}>
        <div />
        {items.map(c => (
          <div key={c.id} className="text-center">
            <span className="text-2xl">{c.emoji}</span>
            <p className="text-xs font-bold text-text">{c.name}</p>
            <button onClick={() => onRemove(c.id)} className="text-[10px] text-red-400 hover:text-red-600">Remove</button>
          </div>
        ))}
      </div>

      {/* Data rows */}
      <Card padding="none">
        {rows.map((row, ri) => {
          const values = items.map(c => c[row.key]);
          const numValues = values.map(v => Number(v));
          const maxVal = Math.max(...numValues);

          return (
            <div key={row.label} className={`grid gap-2 px-3 py-2.5 ${ri < rows.length - 1 ? 'border-b border-border/50' : ''}`} style={{ gridTemplateColumns: `120px repeat(${items.length}, 1fr)` }}>
              <span className="text-xs font-semibold text-muted self-center">{row.label}</span>
              {items.map((c, ci) => {
                const raw = c[row.key];
                const num = Number(raw);
                const isBest = !isNaN(num) && numValues.length > 1 && num === maxVal;
                const label = row.format ? row.format(raw) : String(raw);
                return (
                  <div key={c.id} className={`text-center text-xs font-bold rounded-[8px] py-1.5 ${isBest && typeof raw === 'number' ? 'bg-primary/10 text-primary' : 'text-text'}`}>
                    {label}
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      {/* Soil test CTA */}
      <button
        onClick={() => setShowSoilTest(!showSoilTest)}
        className="flex items-center gap-3 p-4 bg-teal/5 border border-teal/30 rounded-[16px] text-left"
      >
        <span className="text-2xl">🔬</span>
        <div>
          <p className="text-sm font-bold text-teal">{t('estimator.soilTest')}</p>
          <p className="text-xs text-muted">{t('estimator.soilTestDesc')}</p>
        </div>
      </button>
      {showSoilTest && (
        <Card className="bg-teal/5 border-teal/20">
          <p className="text-sm font-semibold text-text mb-2">Get accurate soil & water test results</p>
          <p className="text-xs text-muted mb-3">Partner labs: TNAU Soil Testing Lab · Krishi Vigyan Kendra Chengalpattu</p>
          <p className="text-xs text-muted">Cost: ₹150–₹300 · Results in 5–7 days · Book at the Amenities Hub</p>
        </Card>
      )}
    </div>
  );
}

function Step6Report({ items, pdfDownloads, pdfLoading, onDownload, t }: {
  items: CropRecommendation[];
  pdfDownloads: number;
  pdfLoading: boolean;
  onDownload: () => void;
  t: (k: string) => string;
}) {
  const pdfCapped = pdfDownloads >= 3;
  return (
    <div className="flex flex-col gap-4">
      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200" padding="sm">
        <div className="flex gap-2">
          <InfoIcon size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{t('estimator.disclaimer')}</p>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <h3 className="font-bold text-text mb-3">Report Summary</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted">No crops selected for comparison.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text">{c.name}</p>
                  <p className="text-xs text-muted">Score: {c.suitabilityScore}/100 · Est. Revenue: ₹{(c.estimatedRevenue / 1000).toFixed(1)}K/acre</p>
                </div>
                <ScoreRing score={c.suitabilityScore} size={40} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* PDF Download */}
      <div className="relative">
        <button
          onClick={onDownload}
          disabled={pdfCapped || pdfLoading}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-bold text-sm transition-all ${pdfCapped ? 'bg-gray-100 text-muted cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm'}`}
        >
          {pdfLoading ? <Spinner size={18} /> : pdfCapped ? <LockIcon size={18} /> : <DownloadIcon size={18} />}
          {pdfLoading ? t('estimator.downloading') : pdfCapped ? t('estimator.pdfCap') : t('estimator.downloadPDF')}
        </button>
        {!pdfCapped && (
          <p className="text-center text-xs text-muted mt-2">{pdfDownloads}/3 downloads used this month</p>
        )}
      </div>

      {pdfCapped && (
        <Card className="bg-red-50 border-red-200" padding="sm">
          <div className="flex gap-2">
            <LockIcon size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">{t('estimator.pdfCap')}</p>
              <p className="text-xs text-red-500 mt-0.5">Upgrade to Pro for unlimited PDF reports</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
