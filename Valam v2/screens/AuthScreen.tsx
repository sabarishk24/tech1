import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context';
import { api } from '../api';
import { Button, Input, Spinner } from '../components/ui';
import valamLogo from '../imports/WhatsApp_Image_2026-09-10_at_12.25.49_AM.jpeg';

type AuthMode = 'login' | 'register';
type AuthStep = 'phone' | 'otp';

export default function AuthScreen() {
  const { t, login, navigate } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'B',location:'AuthScreen.tsx:mount',message:'AuthScreen mounted',data:{step,mode,phoneLen:phone.length},timestamp:Date.now()})}).catch(()=>{});
    return () => { fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'B',location:'AuthScreen.tsx:unmount',message:'AuthScreen unmounted',data:{step,mode},timestamp:Date.now()})}).catch(()=>{}); };
    // #endregion
  }, []);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'B',location:'AuthScreen.tsx:step',message:'auth step changed',data:{step,phoneLen:phone.length,loading,error},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [step]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'D',location:'AuthScreen.tsx:handleSendOTP',message:'send OTP clicked',data:{phoneLen:phone.length,phoneLast4:phone.slice(-4),mode,nameLen:name.trim().length,online:navigator.onLine},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    if (mode === 'register' && !name.trim()) { setError('Please enter your name'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await api.requestOtp(phone, name);
      console.info('VALAM local demo OTP:', result.otp);
      // #region agent log
      fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'A',location:'AuthScreen.tsx:handleSendOTP:ok',message:'requestOtp succeeded',data:{ok:result.ok,hasOtp:!!result.otp,otpLen:result.otp?.length||0,isNewUser:result.isNewUser},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      // #region agent log
      fetch('http://127.0.0.1:7292/ingest/7a20f725-2310-4ea2-bf32-01246a4db1ae',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb8ab0'},body:JSON.stringify({sessionId:'bb8ab0',hypothesisId:'A',location:'AuthScreen.tsx:handleSendOTP:err',message:'requestOtp failed',data:{err:e instanceof Error ? e.message : String(e)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleVerify(newOtp);
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpDigits = otp) => {
    const code = otpDigits.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      await login(phone, name || undefined, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      await api.requestOtp(phone, name);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-teal text-white px-6 pt-12 pb-10">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-14 h-14 rounded-[18px] overflow-hidden mx-auto mb-4">
            <img src={valamLogo} alt="VALAM" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black font-display">{t('auth.title')}</h1>
          <p className="text-white/75 text-sm mt-1">{t('auth.subtitle')}</p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-5 -mt-6">
        <div className="w-full max-w-sm bg-white rounded-[22px] shadow-lg p-6">
          {step === 'phone' ? (
            <>
              {/* Mode tabs */}
              <div className="flex bg-surface-2 rounded-[14px] p-1 mb-6">
                {(['login', 'register'] as AuthMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${mode === m ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
                  >
                    {t(`auth.${m}`)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {mode === 'register' && (
                  <Input
                    label={t('auth.name')}
                    placeholder="Arjun Kumar"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                  />
                )}
                <Input
                  label={t('auth.phone')}
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                  maxLength={10}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button fullWidth loading={loading} onClick={handleSendOTP} size="lg">
                  {t('auth.sendOTP')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }} className="flex items-center gap-1 text-primary text-sm font-semibold mb-4 hover:opacity-80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                {t('common.back')}
              </button>
              <h2 className="text-lg font-bold text-text mb-1">{t('auth.enterOTP')}</h2>
              <p className="text-sm text-muted mb-6">{t('auth.otpSent')} <span className="font-semibold text-text">+91 {phone}</span></p>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center mb-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold rounded-[12px] border-2 transition-all focus:outline-none ${digit ? 'border-primary bg-primary/5' : 'border-border'} focus:border-primary`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted text-center mb-6">{t('auth.demoOTP')} · Local OTP: 123456</p>

              {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

              <Button fullWidth loading={loading} onClick={() => handleVerify()} size="lg">
                {t('auth.verify')}
              </Button>

              <div className="text-center mt-4">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="text-sm text-primary font-semibold disabled:text-muted disabled:pointer-events-none"
                >
                  {resendTimer > 0 ? `${t('auth.resendIn')} ${resendTimer}s` : t('auth.resend')}
                </button>
              </div>
            </>
          )}

          {step === 'phone' && (
            <p className="text-center text-xs text-muted mt-4">
              {mode === 'login' ? t('auth.newUser') : t('auth.haveAccount')}{' '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-primary font-semibold">
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Farm illustration hint */}
      <div className="text-center py-6 text-muted text-xs px-4">
        🌾 Connecting farmers to better markets, inputs & insights
      </div>
    </div>
  );
}
