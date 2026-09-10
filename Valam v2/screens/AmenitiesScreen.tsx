import { useEffect, useState } from 'react';
import { useApp } from '../context';
import { requireSupabase, supabase } from '../supabaseClient';
import { AmenityProvider, AmenityService, BundleItem } from '../types';
import {
  Avatar, Badge, Button, Card, Modal, PhoneIcon,
  PlusIcon, SearchIcon, ShieldIcon, StarRating, TrashIcon, XIcon,
} from '../components/ui';
import { ScreenHeader } from '../components/Layout';

type Tab = 'inputs' | 'machinery' | 'labour';

export default function AmenitiesScreen() {
  const { t, bundle, addToBundle, removeFromBundle, clearBundle, createBookings, setHasBackup, showToast, back } = useApp();
  const [tab, setTab] = useState<Tab>('inputs');
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AmenityProvider | null>(null);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [catalogue, setCatalogue] = useState<AmenityProvider[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const client = requireSupabase();
      const [{ data: directory, error: directoryError }, { data: serviceRows, error: serviceError }] = await Promise.all([
        client.from('provider_directory').select('*'),
        client.from('services').select('*').eq('is_available', true),
      ]);
      if (directoryError) throw directoryError;
      if (serviceError) throw serviceError;
      setCatalogue((directory ?? []).map(provider => {
        const services = (serviceRows ?? []).filter(service => service.provider_id === provider.user_id).map(service => ({
          id: service.id, name: service.name, unit: service.unit, price: Number(service.price), available: service.is_available,
        }));
        return {
          id: provider.user_id,
          name: provider.business_name || provider.full_name,
          type: (serviceRows ?? []).find(service => service.provider_id === provider.user_id)?.category ?? 'inputs',
          rating: Number(provider.rating), reliability: 100, isVerified: provider.is_verified,
          jobs: 0, disputes: 0, location: `${provider.district}, ${provider.state}`,
          distance: 0, services, contact: '', initials: (provider.business_name || provider.full_name).slice(0, 2).toUpperCase(), color: 'bg-primary',
        } as AmenityProvider;
      }));
    })().catch(error => { console.error('Provider catalogue failed:', error); showToast('Could not load providers', 'error'); }).finally(() => setCatalogueLoading(false));
  }, [showToast]);

  const providers = catalogue.filter(p => {
    if (p.type !== tab) return false;
    if (verifiedOnly && !p.isVerified) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const bundleTotal = bundle.reduce((s, b) => s + b.price * b.quantity, 0);

  const handleAddService = (provider: AmenityProvider, service: AmenityService) => {
    if (!service.available) { showToast('Service not available', 'error'); return; }
    addToBundle({
      providerId: provider.id,
      serviceId: service.id,
      providerName: provider.name,
      serviceName: service.name,
      quantity: 1,
      unit: service.unit,
      price: service.price,
    });
    showToast(`Added: ${service.name}`, 'success');
  };

  const handleConfirmBundle = async () => {
    try {
      // The first release uses the next morning as the requested slot; providers confirm the final time.
      const requestedFor = new Date();
      requestedFor.setDate(requestedFor.getDate() + 1);
      requestedFor.setHours(9, 0, 0, 0);
      await createBookings(bundle, requestedFor.toISOString());
      setConfirmOpen(false);
      showToast('Booking request sent to the provider.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not create booking', 'error');
    }
  };

  const handleCancelBundle = () => {
    setConfirmOpen(false);
    setHasBackup(true);
    showToast(t('amenities.autoBackup'), 'info');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inputs', label: t('amenities.inputs') },
    { key: 'machinery', label: t('amenities.machinery') },
    { key: 'labour', label: t('amenities.labour') },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader
        title={t('amenities.title')}
        back={back}
        action={
          bundle.length > 0 ? (
            <button
              onClick={() => setBundleOpen(true)}
              className="relative flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-[10px]"
            >
              🧺 {t('amenities.bundle')}
              <span className="ml-1 bg-white text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">{bundle.length}</span>
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex bg-surface-2 rounded-[14px] p-1 gap-0.5">
          {tabs.map(tab_ => (
            <button key={tab_.key} onClick={() => { setTab(tab_.key); setSearch(''); }}
              className={`flex-1 py-2 rounded-[11px] text-xs font-bold transition-all whitespace-nowrap ${tab === tab_.key ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
              {tab_.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="px-4 mb-3 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder={t('common.search')}
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[44px]"
          />
        </div>
        <button
          onClick={() => setVerifiedOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-bold border-2 transition-all whitespace-nowrap ${verifiedOnly ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted'}`}
        >
          <ShieldIcon size={14} /> Verified
        </button>
      </div>

      {/* Provider list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {catalogueLoading ? (
          <div className="text-center py-12 text-muted"><div className="text-3xl mb-2">⏳</div><p className="font-semibold">Loading providers...</p></div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="text-4xl mb-2">🔍</div>
            <p className="font-semibold">No providers found</p>
          </div>
        ) : (
          providers.map(p => (
            <ProviderCard key={p.id} provider={p} onSelect={() => setSelectedProvider(p)}
              onAddService={(s) => handleAddService(p, s)} t={t} />
          ))
        )}
      </div>

      {/* Provider Detail Modal */}
      <Modal
        open={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider?.name ?? ''}
        footer={
          <Button fullWidth onClick={() => { setSelectedProvider(null); }}>
            {t('common.close')}
          </Button>
        }
      >
        {selectedProvider && (
          <ProviderDetail provider={selectedProvider} onAddService={(s) => handleAddService(selectedProvider, s)} t={t} />
        )}
      </Modal>

      {/* Bundle Drawer */}
      <Modal
        open={bundleOpen}
        onClose={() => setBundleOpen(false)}
        title={`${t('amenities.bundle')} (${bundle.length})`}
        footer={
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-text">{t('amenities.bundleTotal')}</span>
              <span className="font-black text-xl text-primary">₹{bundleTotal.toLocaleString()}</span>
            </div>
            <Button fullWidth onClick={() => { setBundleOpen(false); setConfirmOpen(true); }}>
              {t('amenities.confirm')}
            </Button>
          </div>
        }
      >
        {bundle.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <div className="text-4xl mb-2">🧺</div>
            <p>{t('amenities.bundleEmpty')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bundle.map(item => <BundleItemRow key={item.serviceId} item={item} onRemove={() => removeFromBundle(item.serviceId)} />)}
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={handleCancelBundle}
        title={t('amenities.confirmTitle')}
        footer={
          <div className="flex gap-3">
            <button onClick={handleCancelBundle} className="flex-1 py-3 rounded-[14px] border-2 border-border text-muted font-bold text-sm hover:bg-surface-2 transition-colors">
              {t('amenities.cancel')}
            </button>
            <Button className="flex-1" onClick={handleConfirmBundle}>
              {t('amenities.confirm')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Confirm booking for {bundle.length} service(s):</p>
          {bundle.map(item => <BundleItemRow key={item.serviceId} item={item} />)}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="font-bold">{t('amenities.bundleTotal')}</span>
            <span className="font-black text-primary text-xl">₹{bundleTotal.toLocaleString()}</span>
          </div>
          <Card className="bg-amber-50 border-amber-200" padding="sm">
            <p className="text-xs text-amber-700">The provider will receive this request for tomorrow morning and can confirm the final time.</p>
          </Card>
        </div>
      </Modal>
    </div>
  );
}

function ProviderCard({ provider, onSelect, onAddService, t }: {
  provider: AmenityProvider; onSelect: () => void;
  onAddService: (s: AmenityService) => void; t: (k: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar initials={provider.initials} color={provider.color} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text text-sm">{provider.name}</span>
            {provider.isVerified && <Badge variant="teal"><ShieldIcon size={10} /> {t('amenities.verified')}</Badge>}
          </div>
          <StarRating rating={provider.rating} />
          <div className="flex gap-3 mt-1 text-xs text-muted">
            <span>{t('amenities.reliability')}: <span className="font-semibold text-text">{provider.reliability}%</span></span>
            <span>{provider.jobs} {t('amenities.jobs')}</span>
            <span>{provider.distance} km</span>
          </div>
        </div>
        <button onClick={onSelect} className="text-xs font-semibold text-primary border border-primary/30 px-2.5 py-1.5 rounded-[8px] hover:bg-green-50 whitespace-nowrap">
          {t('common.view')}
        </button>
      </div>

      {/* Top service */}
      {provider.services[0] && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">{provider.services[0].name}</p>
              <p className="text-xs text-muted">₹{provider.services[0].price.toLocaleString()} / {provider.services[0].unit}</p>
            </div>
            <button
              onClick={() => onAddService(provider.services[0])}
              disabled={!provider.services[0].available}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${provider.services[0].available ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-muted cursor-not-allowed'}`}
            >
              <PlusIcon size={12} />
              {provider.services[0].available ? t('amenities.addBundle') : 'Unavailable'}
            </button>
          </div>
        </div>
      )}

      {/* Expand for more services */}
      {provider.services.length > 1 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-2 text-xs text-primary font-semibold">
          {expanded ? '▲ Less' : `▼ ${provider.services.length - 1} more services`}
        </button>
      )}
      {expanded && provider.services.slice(1).map(s => (
        <div key={s.id} className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <div>
            <p className="text-sm font-medium text-text">{s.name}</p>
            <p className="text-xs text-muted">₹{s.price.toLocaleString()} / {s.unit}</p>
          </div>
          <button
            onClick={() => onAddService(s)}
            disabled={!s.available}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${s.available ? 'bg-primary text-white' : 'bg-gray-100 text-muted cursor-not-allowed'}`}
          >
            <PlusIcon size={12} />
            {s.available ? 'Add' : 'Unavailable'}
          </button>
        </div>
      ))}
    </Card>
  );
}

function ProviderDetail({ provider, onAddService, t }: {
  provider: AmenityProvider; onAddService: (s: AmenityService) => void; t: (k: string) => string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar initials={provider.initials} color={provider.color} size={60} />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-black text-text text-lg">{provider.name}</h2>
            {provider.isVerified && <Badge variant="teal"><ShieldIcon size={10} /> Verified</Badge>}
          </div>
          <p className="text-sm text-muted">{provider.location}</p>
          <StarRating rating={provider.rating} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Reliability', value: `${provider.reliability}%` },
          { label: 'Jobs Done', value: provider.jobs.toString() },
          { label: 'Disputes', value: provider.disputes.toString() },
        ].map(s => (
          <div key={s.label} className="bg-surface-2 rounded-[12px] p-3 text-center">
            <p className="text-lg font-black text-text">{s.value}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <PhoneIcon size={16} className="text-muted" />
        <a href={`tel:${provider.contact}`} className="text-primary font-semibold text-sm">{provider.contact}</a>
      </div>

      <div>
        <h3 className="font-bold text-text mb-3">Services</h3>
        <div className="flex flex-col gap-2">
          {provider.services.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-[12px]">
              <div>
                <p className="text-sm font-semibold text-text">{s.name}</p>
                <p className="text-xs text-muted">₹{s.price.toLocaleString()} / {s.unit}</p>
              </div>
              <button
                onClick={() => onAddService(s)}
                disabled={!s.available}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${s.available ? 'bg-primary text-white' : 'bg-gray-200 text-muted cursor-not-allowed'}`}
              >
                {s.available ? 'Add' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BundleItemRow({ item, onRemove }: { item: BundleItem; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{item.serviceName}</p>
        <p className="text-xs text-muted">{item.providerName} · ₹{item.price.toLocaleString()} / {item.unit}</p>
      </div>
      <span className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
      {onRemove && (
        <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}

function MatchingView({ providers, onSelect, t }: { providers: AmenityProvider[]; onSelect: (p: AmenityProvider) => void; t: (k: string) => string }) {
  return (
    <div className="flex flex-col gap-3">
      <Card className="bg-primary/5 border-primary/20" padding="sm">
        <p className="text-sm font-semibold text-primary">🎯 AI-Matched for Your Farm</p>
        <p className="text-xs text-muted mt-0.5">Based on your 3-acre Chengalpattu farm with paddy cultivation</p>
      </Card>
      {providers.filter(p => p.isVerified).slice(0, 4).map(p => (
        <div key={p.id} className="flex items-center gap-3 bg-white rounded-[14px] p-3 border border-border shadow-sm">
          <Avatar initials={p.initials} color={p.color} size={40} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text text-sm">{p.name}</p>
            <p className="text-xs text-muted capitalize">{p.type} · {p.distance} km</p>
            <StarRating rating={p.rating} />
          </div>
          <button onClick={() => onSelect(p)} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-[10px]">
            View
          </button>
        </div>
      ))}
    </div>
  );
}
