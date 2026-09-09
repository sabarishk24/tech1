import { useState } from 'react';
import { useApp } from '../context';
import { Badge, Card, StarRating } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

const REQUESTS = [
  { id: 'r1', farmer: 'Suresh Patel', service: 'Tractor + Driver (8hr)', date: '2026-09-12', status: 'pending', amount: 2200 },
  { id: 'r2', farmer: 'Kavitha Devi', service: 'Harvester (2 acres)', date: '2026-09-14', status: 'pending', amount: 3600 },
  { id: 'r3', farmer: 'Ramu Krishnan', service: 'Power Tiller (4hr)', date: '2026-09-10', status: 'confirmed', amount: 900 },
  { id: 'r4', farmer: 'Anbu Selvam', service: 'Tractor + Driver (8hr)', date: '2026-09-08', status: 'completed', amount: 2200 },
];

export default function ProviderScreen() {
  const { t, back } = useApp();
  const [requests, setRequests] = useState(REQUESTS);
  const [tab, setTab] = useState<'requests' | 'availability' | 'stats'>('requests');
  const [available, setAvailable] = useState(true);

  const confirm = (id: string) => setRequests(r => r.map(x => x.id === id ? { ...x, status: 'confirmed' } : x));
  const decline = (id: string) => setRequests(r => r.filter(x => x.id !== id));

  const pending = requests.filter(r => r.status === 'pending').length;
  const earnings = requests.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);

  const statusColor: Record<string, 'amber' | 'green' | 'gray'> = {
    pending: 'amber', confirmed: 'green', completed: 'gray',
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('nav.provider')} back={back} />

      {/* Stats bar */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-2">
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-3 text-center">
          <p className="text-xl font-black text-amber-600">{pending}</p>
          <p className="text-[11px] text-amber-700">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-[14px] p-3 text-center">
          <p className="text-xl font-black text-primary">₹{(earnings / 1000).toFixed(1)}K</p>
          <p className="text-[11px] text-green-700">Earned</p>
        </div>
        <div className="bg-surface-2 rounded-[14px] p-3 text-center">
          <p className="text-xl font-black text-text">4.8</p>
          <p className="text-[11px] text-muted">Rating</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex bg-surface-2 rounded-[14px] p-1 gap-0.5">
          {(['requests', 'availability', 'stats'] as const).map(t_ => (
            <button key={t_} onClick={() => setTab(t_)}
              className={`flex-1 py-2 rounded-[11px] text-xs font-bold capitalize transition-all ${tab === t_ ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
              {t_ === 'requests' ? `Requests${pending ? ` (${pending})` : ''}` : t_}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {tab === 'requests' && (
          <>
            {requests.map(req => (
              <Card key={req.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                    {req.farmer[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">{req.farmer}</span>
                      <Badge variant={statusColor[req.status]}>{req.status}</Badge>
                    </div>
                    <p className="text-xs text-muted">{req.service}</p>
                    <p className="text-xs text-muted">Date: {req.date} · ₹{req.amount.toLocaleString()}</p>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => decline(req.id)}
                      className="flex-1 py-2 rounded-[10px] border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
                      Decline
                    </button>
                    <button onClick={() => confirm(req.id)}
                      className="flex-1 py-2 rounded-[10px] bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors">
                      Confirm
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {tab === 'availability' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-text">Availability Status</p>
                  <p className="text-sm text-muted mt-0.5">{available ? 'Accepting new bookings' : 'Not accepting bookings'}</p>
                </div>
                <button
                  onClick={() => setAvailable(v => !v)}
                  className={`w-14 h-7 rounded-full transition-all relative ${available ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${available ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </Card>
            <Card>
              <p className="font-bold text-text mb-3">Busy Dates</p>
              <div className="flex flex-wrap gap-2">
                {['Sep 10', 'Sep 14', 'Sep 20', 'Sep 21'].map(d => (
                  <span key={d} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-[8px]">{d}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'stats' && (
          <div className="flex flex-col gap-4">
            <Card>
              <h3 className="font-bold text-text mb-3">Performance</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Total Jobs Completed', value: '587' },
                  { label: 'Reliability Score', value: '98%' },
                  { label: 'Active Disputes', value: '0' },
                  { label: 'Avg Response Time', value: '< 2 hours' },
                  { label: 'Customer Rating', value: '4.8 / 5.0' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted">{s.label}</span>
                    <span className="text-sm font-black text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-text mb-2">Rating Breakdown</h3>
              <StarRating rating={4.8} />
              <div className="mt-3 flex flex-col gap-1">
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="text-muted w-4">{stars}★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${stars === 5 ? 75 : stars === 4 ? 18 : stars === 3 ? 5 : 2}%` }} />
                    </div>
                    <span className="text-muted">{stars === 5 ? '75%' : stars === 4 ? '18%' : stars === 3 ? '5%' : '2%'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
