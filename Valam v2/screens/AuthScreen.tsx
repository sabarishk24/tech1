import { useState } from 'react';
import { useApp } from '../context';
import { isSupabaseConfigured, requireSupabase } from '../supabaseClient';
import { Button, Input, Spinner } from '../components/ui';
import valamLogo from '../imports/WhatsApp_Image_2026-09-10_at_12.25.49_AM.jpeg';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { t, login } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');
    if (!isSupabaseConfigured) {
      setError('VALAM is not connected yet. Complete the Supabase connection step first.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return; }
    if (mode === 'register' && !name.trim()) { setError('Enter your name'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, name, mode);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Could not sign in.';
      if (text.startsWith('Check your email')) {
        setMessage(text);
        setMode('login');
      } else setError(text);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter your email address first'); return; }
    if (!isSupabaseConfigured) { setError('VALAM is not connected yet.'); return; }
    setLoading(true);
    try {
      const { error: resetError } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` });
      if (resetError) throw resetError;
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-gradient-to-br from-primary to-teal text-white px-6 pt-12 pb-10">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-14 h-14 rounded-[18px] overflow-hidden mx-auto mb-4"><img src={valamLogo} alt="VALAM" className="w-full h-full object-cover" /></div>
          <h1 className="text-2xl font-black font-display">{t('auth.title')}</h1>
          <p className="text-white/75 text-sm mt-1">Secure account for your farm and bookings</p>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-5 -mt-6">
        <div className="w-full max-w-sm bg-white rounded-[22px] shadow-lg p-6">
          <div className="flex bg-surface-2 rounded-[14px] p-1 mb-6">
            {(['login', 'register'] as const).map(item => <button key={item} onClick={() => { setMode(item); setError(''); setMessage(''); }} className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${mode === item ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>{item === 'login' ? 'Sign in' : 'Create account'}</button>)}
          </div>
          <div className="flex flex-col gap-4">
            {mode === 'register' && <Input label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Kumar" autoComplete="name" />}
            <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2">{error}</p>}
            {message && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-[10px] px-3 py-2">{message}</p>}
            <Button fullWidth size="lg" onClick={submit} loading={loading}>{loading ? <><Spinner size={16} /> Please wait...</> : mode === 'login' ? 'Sign in securely' : 'Create VALAM account'}</Button>
            {mode === 'login' && <button onClick={resetPassword} disabled={loading} className="text-sm text-primary font-semibold text-center">Forgot password?</button>}
          </div>
          <p className="mt-5 text-center text-xs text-muted">{mode === 'register' ? 'We will send a verification email before activating your account.' : 'Use the email and password you registered with.'}</p>
        </div>
      </div>
    </div>
  );
}
