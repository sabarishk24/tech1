import { useState } from 'react';
import { useApp } from '../context';
import { Card, Badge, Button } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

const ALL_DISEASES = [
  { id: 'd1', name: 'Rice Blast', crop: 'Paddy', risk: 'high', symptoms: 'Diamond-shaped lesions on leaves, gray centers with brown borders.', treatment: 'Spray Tricyclazole (0.6g/L) or Isoprothiolane (1.5ml/L). Reduce nitrogen. Improve drainage.', prevention: 'Use resistant varieties. Avoid excess nitrogen. Maintain proper spacing.' },
  { id: 'd2', name: 'Brown Plant Hopper', crop: 'Paddy', risk: 'high', symptoms: 'Yellowing and wilting of plants, hopping insects at base.', treatment: 'Apply Imidacloprid or Thiamethoxam. Drain field for 3-4 days.', prevention: 'Use BPH-resistant varieties. Avoid excess nitrogen fertilizer. Maintain field hygiene.' },
  { id: 'd3', name: 'Tikka Disease', crop: 'Groundnut', risk: 'medium', symptoms: 'Small circular spots with yellow halo on leaves, defoliation.', treatment: 'Spray Mancozeb (0.25%) or Carbendazim (0.1%). Apply at 10-day intervals.', prevention: 'Crop rotation. Seed treatment with Thiram. Use certified disease-free seeds.' },
  { id: 'd4', name: 'Stem Borer', crop: 'Paddy', risk: 'medium', symptoms: 'Dead heart in vegetative stage, white ears at reproductive stage.', treatment: 'Apply Chlorantraniliprole or Cartap hydrochloride. Remove and destroy egg masses.', prevention: 'Synchronize planting. Use light traps. Maintain proper plant spacing.' },
  { id: 'd5', name: 'Early Leaf Spot', crop: 'Groundnut', risk: 'medium', symptoms: 'Circular brown spots on upper surface of leaves, yellow halos.', treatment: 'Spray Chlorothalonil (0.2%) or Mancozeb at 15-day intervals.', prevention: 'Use certified seeds. Practice crop rotation. Avoid overhead irrigation.' },
  { id: 'd6', name: 'Red Rot', crop: 'Sugarcane', risk: 'high', symptoms: 'Drying of central leaf, red discoloration in stalk tissue, foul odour.', treatment: 'Remove and destroy infected stools. Apply Carbendazim drenching. Use healthy setts.', prevention: 'Use resistant varieties. Hot water treatment of setts. Field sanitation.' },
  { id: 'd7', name: 'Smut', crop: 'Sugarcane', risk: 'medium', symptoms: 'Long whip-like structures emerging from shoot tip, stunted growth.', treatment: 'Uproot and destroy affected plants. Dip setts in Carbendazim solution.', prevention: 'Use disease-free setts. Treat setts with fungicide before planting.' },
  { id: 'd8', name: 'Powdery Mildew', crop: 'Vegetables', risk: 'medium', symptoms: 'White powdery coating on leaves and stems, leaf distortion.', treatment: 'Spray Wettable Sulphur (0.3%) or Carbendazim (0.1%) at weekly intervals.', prevention: 'Ensure good air circulation. Avoid overhead watering. Plant resistant varieties.' },
  { id: 'd9', name: 'Leaf Curl Virus', crop: 'Cotton', risk: 'high', symptoms: 'Upward or downward curling of leaves, vein thickening, stunted growth.', treatment: 'Remove and destroy infected plants. Control whitefly vectors with Imidacloprid.', prevention: 'Use virus-free seeds. Control whitefly. Plant at recommended spacing.' },
  { id: 'd10', name: 'Wilt', crop: 'Cotton', risk: 'high', symptoms: 'Sudden wilting of plant, browning of vascular tissue, plant death.', treatment: 'Drench soil with Carbendazim (0.1%). Remove affected plants. Improve drainage.', prevention: 'Crop rotation. Use resistant varieties. Treat seeds with Trichoderma.' },
  { id: 'd11', name: 'Downy Mildew', crop: 'Maize', risk: 'medium', symptoms: 'Yellow stripes on leaves, white downy growth on undersurface.', treatment: 'Spray Metalaxyl (0.2%) or Mancozeb (0.25%) early in season.', prevention: 'Use resistant varieties. Seed treatment with Metalaxyl. Early sowing.' },
  { id: 'd12', name: 'Turcicum Blight', crop: 'Maize', risk: 'medium', symptoms: 'Long elliptical grayish-green lesions on leaves turning tan.', treatment: 'Spray Mancozeb or Zineb (0.2%) at 10-15 day intervals.', prevention: 'Use resistant hybrids. Crop rotation. Remove crop debris after harvest.' },
];

const CROPS = ['All', 'Paddy', 'Groundnut', 'Sugarcane', 'Cotton', 'Maize', 'Vegetables'];

type BookingStatus = 'idle' | 'booked' | 'completed';

export default function DiseaseScreen() {
  const { t, back, showToast } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropFilter, setCropFilter] = useState('All');
  const [cropInput, setCropInput] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  const filtered = ALL_DISEASES.filter(d => {
    const chip = cropFilter === 'All' || d.crop === cropFilter;
    const text = !cropInput.trim() || d.crop.toLowerCase().includes(cropInput.toLowerCase());
    return chip && text;
  });

  const handleBook = () => {
    if (!bookingName.trim() || !bookingDate) {
      showToast('Please fill in your name and preferred date', 'error');
      return;
    }
    setBookingStatus('booked');
    showToast('Disease test booked! Our agent will visit your farm.', 'success');
  };

  const handleToggleComplete = () => {
    setBookingStatus('completed');
    showToast('Disease test marked as completed', 'success');
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('nav.disease')} back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">

        {/* Regional alert */}
        <Card className="bg-amber-50 border-amber-200" padding="sm">
          <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Active Disease Alert — Chengalpattu</p>
          <p className="text-xs text-amber-600">Paddy Blast reported in 3 farms within 10 km. High humidity (80%+) increases risk this week.</p>
        </Card>

        {/* Crop filter — text input */}
        <div>
          <label className="text-sm font-semibold text-text block mb-1.5">Search by crop</label>
          <input
            type="text"
            placeholder="e.g. Paddy, Cotton, Maize..."
            value={cropInput}
            onChange={e => { setCropInput(e.target.value); setCropFilter('All'); }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Crop chip filters */}
        <div className="flex gap-2 flex-wrap">
          {CROPS.map(c => (
            <button
              key={c}
              onClick={() => { setCropFilter(c); setCropInput(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${cropFilter === c && !cropInput ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/40'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Disease list */}
        <div>
          <h3 className="font-bold text-text mb-3">
            Common Diseases This Season
            {(cropFilter !== 'All' || cropInput) && (
              <span className="ml-2 text-xs font-normal text-muted">
                — {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{cropInput || cropFilter}"
              </span>
            )}
          </h3>

          {filtered.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-3xl mb-2">🌿</div>
              <p className="text-sm text-muted">No diseases found for this crop.</p>
              <button onClick={() => { setCropFilter('All'); setCropInput(''); }} className="text-xs text-primary font-semibold mt-2">
                Clear filter
              </button>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(d => (
                <Card key={d.id} onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🦠</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-text">{d.name}</span>
                        <Badge variant={d.risk === 'high' ? 'red' : 'amber'}>{d.risk} risk</Badge>
                      </div>
                      <p className="text-xs text-muted">Affects: {d.crop}</p>
                    </div>
                    <span className="text-muted text-sm">{selectedId === d.id ? '▲' : '▼'}</span>
                  </div>
                  {selectedId === d.id && (
                    <div className="mt-3 border-t border-border/50 pt-3 flex flex-col gap-2">
                      <div>
                        <p className="text-xs font-bold text-text mb-1">Symptoms:</p>
                        <p className="text-xs text-muted">{d.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text mb-1">Treatment:</p>
                        <p className="text-xs text-muted">{d.treatment}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text mb-1">Prevention:</p>
                        <p className="text-xs text-muted">{d.prevention}</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Disease Test Booking */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-text">Crop Disease Test Booking</h3>
            {bookingStatus === 'booked' && <Badge variant="amber">Booked</Badge>}
            {bookingStatus === 'completed' && <Badge variant="green">Completed</Badge>}
          </div>

          {bookingStatus === 'idle' && (
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔬</span>
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">Field Disease Testing</p>
                  <p className="text-xs text-muted mt-0.5">A certified agricultural officer visits your farm to test crops for diseases and provide a written report with treatment recommendations.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun Kumar"
                    value={bookingName}
                    onChange={e => setBookingName(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Preferred Visit Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <div className="bg-surface-2 rounded-[12px] p-3 flex gap-3 text-xs text-muted">
                  <span className="flex-shrink-0">ℹ️</span>
                  <span>Testing fee: ₹200–₹500 depending on number of crops. Report delivered within 48 hours.</span>
                </div>

                <Button onClick={handleBook} className="w-full">
                  🔬 Book Disease Test
                </Button>
              </div>
            </Card>
          )}

          {bookingStatus === 'booked' && (
            <Card className="border-2 border-amber-200 bg-amber-50/40">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📅</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text text-sm">Test Booked</p>
                  <p className="text-xs text-muted mt-0.5">An agricultural officer will visit your farm on <strong>{bookingDate}</strong>. You will receive a confirmation call 24 hours before.</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-text">Mark as Completed</span>
                <button
                  onClick={handleToggleComplete}
                  className="relative w-12 h-6 rounded-full bg-border transition-colors focus:outline-none"
                >
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                </button>
              </div>
            </Card>
          )}

          {bookingStatus === 'completed' && (
            <Card className="border-2 border-primary/30 bg-green-50/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary text-sm">Booking Completed</p>
                  <p className="text-xs text-muted mt-0.5">Your disease test has been completed. The written report with treatment recommendations should have been delivered to you.</p>
                </div>
              </div>
              <div className="mt-3 border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="text-xs text-muted">Completed on {bookingDate}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-primary">Completed</span>
                  <button
                    onClick={() => {}}
                    className="relative w-12 h-6 rounded-full bg-primary transition-colors focus:outline-none"
                  >
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
