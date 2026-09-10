import { useApp } from '../context';
import { Alert } from '../types';
import { Badge, Button, Card } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

const TYPE_ICONS: Record<Alert['type'], string> = {
  weather: '🌧️', market: '📊', disease: '🔬', scheme: '📋', reminder: '⏰',
};

const PRIORITY_COLORS = {
  high: 'red' as const,
  medium: 'amber' as const,
  low: 'gray' as const,
};

export default function AlertsScreen() {
  const { t, alerts, markAlertRead, markAllRead, navigate, back } = useApp();
  const unread = alerts.filter(a => !a.isRead).length;

  const grouped = {
    high: alerts.filter(a => a.priority === 'high'),
    medium: alerts.filter(a => a.priority === 'medium'),
    low: alerts.filter(a => a.priority === 'low'),
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader
        title={t('alerts.title')}
        back={back}
        action={
          unread > 0 ? (
            <button onClick={markAllRead} className="text-xs font-semibold text-primary border border-primary/30 px-3 py-2 rounded-[10px] hover:bg-green-50 min-h-[36px]">
              {t('alerts.markRead')}
            </button>
          ) : undefined
        }
      />

      {unread > 0 && (
        <div className="px-4 mb-3">
          <div className="bg-primary/10 rounded-[12px] px-4 py-2">
            <p className="text-sm font-semibold text-primary">{unread} {t('alerts.unread')} alerts</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {(['high', 'medium', 'low'] as const).map(priority => {
          const group = grouped[priority];
          if (group.length === 0) return null;
          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={PRIORITY_COLORS[priority]}>{t(`alerts.${priority}`)}</Badge>
                <span className="text-xs text-muted">({group.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {group.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onRead={() => markAlertRead(alert.id)}
                    onAction={() => {
                      markAlertRead(alert.id);
                      if (alert.actionScreen) navigate(alert.actionScreen);
                    }}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔔</div>
            <p className="font-semibold text-text">{t('alerts.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onRead, onAction, t }: {
  alert: Alert; onRead: () => void; onAction: () => void; t: (k: string) => string;
}) {
  const borderColors = { high: 'border-l-red-500', medium: 'border-l-amber-400', low: 'border-l-gray-300' };

  return (
    <Card
      className={`border-l-4 ${borderColors[alert.priority]} ${!alert.isRead ? 'shadow-md' : 'opacity-75'}`}
      onClick={!alert.isRead ? onRead : undefined}
    >
      <div className="flex gap-3">
        <div className="text-2xl flex-shrink-0">{TYPE_ICONS[alert.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-bold ${!alert.isRead ? 'text-text' : 'text-muted'}`}>{alert.title}</h3>
            {!alert.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
          </div>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{alert.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted">
              {new Date(alert.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            {alert.actionLabel && alert.actionScreen && (
              <button
                onClick={e => { e.stopPropagation(); onAction(); }}
                className="text-xs font-bold text-primary border border-primary/30 px-2.5 py-1 rounded-[8px] hover:bg-green-50 transition-colors"
              >
                {alert.actionLabel} →
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
