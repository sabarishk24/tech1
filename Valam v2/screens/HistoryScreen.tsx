import { useApp } from '../context';
import { Card } from '../components/ui';
import { ScreenHeader } from '../components/Layout';
import { ActivityLog } from '../types';

const TYPE_COLORS: Record<ActivityLog['type'], string> = {
  account: 'bg-purple-100 text-purple-700',
  profile: 'bg-green-100 text-green-700',
  booking: 'bg-amber-100 text-amber-700',
  test: 'bg-teal-100 text-teal-700',
  ledger: 'bg-blue-100 text-blue-700',
  scheme: 'bg-indigo-100 text-indigo-700',
  enquiry: 'bg-orange-100 text-orange-700',
  sell: 'bg-pink-100 text-pink-700',
};

const TYPE_LABELS: Record<ActivityLog['type'], string> = {
  account: 'Account',
  profile: 'Profile',
  booking: 'Booking',
  test: 'Test',
  ledger: 'Ledger',
  scheme: 'Scheme',
  enquiry: 'Enquiry',
  sell: 'Market',
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const { back, activityLog } = useApp();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title="Activity History" back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
        <p className="text-xs text-muted mt-1">Complete record of your actions from account creation to now.</p>

        {activityLog.length === 0 ? (
          <Card className="text-center py-10">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-muted">No activity yet.</p>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-border/60" />

            <div className="flex flex-col gap-0">
              {activityLog.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-3 pb-4 relative">
                  {/* Icon bubble */}
                  <div className="w-[56px] flex-shrink-0 flex items-center justify-center z-10">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-border flex items-center justify-center text-lg shadow-sm">
                      {entry.icon}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-[14px] border border-border/60 px-4 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-text text-sm">{entry.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[entry.type]}`}>
                            {TYPE_LABELS[entry.type]}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{entry.detail}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted/70 mt-1.5">{formatTimestamp(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted mt-2">Showing all {activityLog.length} events · VALAM records all actions for transparency</p>
      </div>
    </div>
  );
}
