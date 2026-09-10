import { useState } from 'react';
import { useApp } from '../context';
import { ScreenHeader } from '../components/Layout';

const PROVIDER_CREDENTIALS: Record<string, { name: string; business: string; type: string }> = {
  'RAJAN-PRO-2024': { name: 'Rajan Kumar', business: 'Rajan Tractors', type: 'Machinery' },
  'KUMAR-AGR-2024': { name: 'Kumar Selvam', business: 'Kumar Agro Supplies', type: 'Inputs' },
  'MURUGAN-LAB-24': { name: 'Murugan Raj', business: 'Murugan Labour Services', type: 'Labour' },
  'VEL-MACH-2024': { name: 'Vel Krishnan', business: 'Vel Modern Machinery', type: 'Machinery' },
  'DEMO': { name: 'Demo Provider', business: 'VALAM Demo Account', type: 'All Services' },
};

export default function ProviderLoginScreen() {
  const { navigate, back, showToast } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<typeof PROVIDER_CREDENTIALS[string] | null>(null);

  const handleVerify = async () => {
    setError('');
    if (!code.trim()) { setError('Please enter your access code'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    const match = PROVIDER_CREDENTIALS[code.trim().toUpperCase()];
    if (!match) {
      setError('Invalid access code. Contact VALAM support to get your provider credentials.');
      return;
    }
    setVerified(match);
  };

  const handleEnter = () => {
    navigate('provider');
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title="Provider Dashboard" back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4 max-w-sm mx-auto w-full pt-4">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-teal rounded-[20px] p-5 text-white text-center">
          <div className="text-4xl mb-2">🏪</div>
          <h2 className="font-black text-lg">Provider Access</h2>
          <p className="text-sm text-white/75 mt-1">Exclusive dashboard for VALAM-verified service providers</p>
        </div>

        {!verified ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">🔐 Providers Only</p>
              <p className="text-xs text-amber-700">This section is restricted to registered agricultural service providers. If you are a farmer looking to book services, visit <strong>Amenities</strong> from the main menu.</p>
            </div>

            <div className="bg-white rounded-[20px] border border-border p-5 flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-text block mb-2">Provider Access Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(''); }}
                  placeholder="e.g. RAJAN-PRO-2024"
                  className="w-full min-h-[50px] px-4 py-3 rounded-[14px] border-2 border-border bg-surface-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-[14px] hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                ) : 'Verify Access Code'}
              </button>

              <div className="border-t border-border/50 pt-4">
                <p className="text-xs text-muted text-center">Don't have a code?</p>
                <p className="text-xs text-muted text-center mt-1">Contact VALAM at <span className="text-primary font-semibold">support@valam.in</span> or call <span className="text-primary font-semibold">1800-103-7693</span> to get verified as a provider.</p>
              </div>

              {/* Demo hint for hackathon */}
              <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-3">
                <p className="text-[11px] text-blue-700 font-semibold mb-1">🎯 Demo Mode</p>
                <p className="text-[11px] text-blue-600">Try code: <span className="font-mono font-bold">DEMO</span> or <span className="font-mono font-bold">RAJAN-PRO-2024</span></p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-[20px] p-5 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-black text-green-800 text-lg">Verified!</p>
              <p className="text-sm text-green-700 mt-1">{verified.name}</p>
              <div className="mt-3 bg-white rounded-[12px] p-3 flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Business</span>
                  <span className="font-semibold text-text">{verified.business}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Type</span>
                  <span className="font-semibold text-text">{verified.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Status</span>
                  <span className="font-semibold text-green-600">✓ Active Provider</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnter}
              className="w-full py-4 bg-primary text-white font-bold rounded-[16px] hover:bg-primary-dark transition-all active:scale-[0.98] text-base"
            >
              Enter Provider Dashboard →
            </button>

            <button
              onClick={() => { setVerified(null); setCode(''); }}
              className="text-sm text-muted text-center"
            >
              Sign in with a different code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
