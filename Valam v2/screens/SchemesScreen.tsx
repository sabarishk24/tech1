import { useState } from 'react';
import { useApp } from '../context';
import { SCHEMES } from '../data';
import { Scheme } from '../types';
import { Badge, Card, Modal } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

export default function SchemesScreen() {
  const { t, back } = useApp();
  const [tab, setTab] = useState<'schemes' | 'loans'>('schemes');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const filtered = SCHEMES.filter(s => s.type === (tab === 'schemes' ? 'scheme' : 'loan'));
  const eligible = filtered.filter(s => s.isEligible).length;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t('schemes.title')} back={back} />

      {eligible > 0 && (
        <div className="px-4 mb-3">
          <div className="bg-green-50 border border-green-200 rounded-[14px] px-4 py-3 flex items-center gap-2">
            <span className="text-green-600 text-lg">✅</span>
            <p className="text-sm font-semibold text-green-800">You are eligible for {eligible} {tab}</p>
          </div>
        </div>
      )}

      <div className="px-4 mb-3">
        <div className="flex bg-surface-2 rounded-[14px] p-1">
          <button onClick={() => setTab('schemes')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${tab === 'schemes' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            {t('schemes.schemes')}
          </button>
          <button onClick={() => setTab('loans')}
            className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${tab === 'loans' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
            {t('schemes.loans')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {filtered.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} onSelect={() => setSelectedScheme(scheme)} t={t} />
        ))}
      </div>

      <Modal
        open={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
        title={selectedScheme?.name ?? ''}
        footer={
          selectedScheme?.isEligible ? (
            <a
              href={selectedScheme.govUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 bg-primary text-white font-bold rounded-[14px] hover:bg-primary-dark transition-colors text-center"
            >
              {t('schemes.apply')} — Official Website →
            </a>
          ) : undefined
        }
      >
        {selectedScheme && <SchemeDetail scheme={selectedScheme} t={t} />}
      </Modal>
    </div>
  );
}

function SchemeCard({ scheme, onSelect, t }: { scheme: Scheme; onSelect: () => void; t: (k: string) => string }) {
  return (
    <Card onClick={onSelect} className={scheme.isEligible ? 'border-2 border-primary/30' : ''}>
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{scheme.type === 'scheme' ? '📋' : '🏦'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-text">{scheme.name}</span>
            {scheme.isEligible && <Badge variant="green">✓ {t('schemes.eligible')}</Badge>}
          </div>
          <p className="text-xs text-muted mb-2">{scheme.description}</p>
          <div className="flex gap-3 text-xs">
            <div>
              <span className="text-muted">{t('schemes.amount')}: </span>
              <span className="font-semibold text-primary">{scheme.amount}</span>
            </div>
            <div>
              <span className="text-muted">{t('schemes.deadline')}: </span>
              <span className="font-semibold text-text">{scheme.deadline}</span>
            </div>
          </div>
        </div>
      </div>
      {scheme.isEligible && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <a
            href={scheme.govUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="block w-full py-2 bg-primary text-white text-sm font-bold rounded-[12px] hover:bg-primary-dark transition-colors text-center"
          >
            {t('schemes.apply')} →
          </a>
        </div>
      )}
    </Card>
  );
}

function SchemeDetail({ scheme, t }: { scheme: Scheme; t: (k: string) => string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{scheme.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-2 rounded-[12px] p-3">
          <p className="text-xs text-muted">{t('schemes.amount')}</p>
          <p className="font-bold text-primary mt-0.5">{scheme.amount}</p>
        </div>
        <div className="bg-surface-2 rounded-[12px] p-3">
          <p className="text-xs text-muted">{t('schemes.deadline')}</p>
          <p className="font-bold text-text mt-0.5">{scheme.deadline}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-text mb-2">Eligibility Criteria</h4>
        <ul className="flex flex-col gap-1.5">
          {scheme.eligibility.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              {e}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-bold text-text mb-2">{t('schemes.benefits')}</h4>
        <ul className="flex flex-col gap-1.5">
          {scheme.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {!scheme.isEligible && (
        <Card className="bg-red-50 border-red-200" padding="sm">
          <p className="text-xs text-red-600">You may not be eligible for this scheme based on your current profile. Update your profile for accurate eligibility check.</p>
        </Card>
      )}
    </div>
  );
}
