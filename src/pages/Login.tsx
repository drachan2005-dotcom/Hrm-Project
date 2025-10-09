// Trang Ä‘Äƒng nháº­p vá»›i 2FA thá»±c táº¿
import { useState } from 'react';
import * as OTPAuth from 'otpauth';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HelpCircle } from 'lucide-react';
import { TwoFactorPrompt } from '../components/auth/TwoFactorPrompt';

interface LoginProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void;
  onLoginSuccess: () => void;
  onRequire2FA: (value: boolean) => void;
}

type LoginStep = 'login' | '2fa';

export function Login({ onNavigate, onLoginSuccess, onRequire2FA }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<LoginStep>('login');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [lastVerifiedStep, setLastVerifiedStep] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetTwoFactorState = () => {
    setTwoFactorCode('');
    setTwoFactorSecret(null);
    setLastVerifiedStep(null);
    setStep('login');
    setError('');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Supabase configuration missing (.env not set)');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if ('status' in signInError && signInError.status === 400) {
          throw new Error('Invalid email or password');
        }
        throw signInError;
      }

      const user = data.user;
      if (!user) {
        throw new Error('Unable to locate user information');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('two_fa_enabled, two_fa_secret')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (profileData?.two_fa_enabled) {
        if (!profileData.two_fa_secret) {
          await supabase.auth.signOut();
          throw new Error('Account requires 2FA but secret is missing');
        }

        onRequire2FA(true);
        setTwoFactorSecret(profileData.two_fa_secret);
        setTwoFactorCode('');
        setStep('2fa');
        return;
      }

      onRequire2FA(false);
      resetTwoFactorState();
      onLoginSuccess();
    } catch (err) {
      await supabase.auth.signOut();
      onRequire2FA(false);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    setError('');

    if (!/^\d{6}$/.test(twoFactorCode)) {
      setError('Enter the 6-digit 2FA code');
      return;
    }

    setLoading(true);
    try {
      if (!twoFactorSecret) {
        await supabase.auth.signOut();
        throw new Error('2FA secret missing, please sign in again.');
      }

      const secret = OTPAuth.Secret.fromBase32(twoFactorSecret);
      const totp = new OTPAuth.TOTP({
        issuer: 'HRM Cloud',
        label: email.trim() || 'user',
        secret,
        digits: 6,
        period: 30,
      });

      const delta = totp.validate({ token: twoFactorCode, window: 0 });

      if (delta === null) {
        throw new Error('OTP expired or incorrect.');
      }

      const currentStepIndex = Math.floor(Date.now() / (totp.period * 1000));

      if (lastVerifiedStep !== null && currentStepIndex === lastVerifiedStep) {
        throw new Error('This OTP code was already used. Please wait for the next code.');
      }

      const sessionStorageKey = email ? `last2faStep:${email.toLowerCase()}` : null;
      if (sessionStorageKey && typeof window !== 'undefined') {
        const previousStep = Number(window.sessionStorage.getItem(sessionStorageKey));
        if (!Number.isNaN(previousStep) && previousStep === currentStepIndex) {
          throw new Error('This OTP code was already used. Please wait for the next code.');
        }
      }

      setLastVerifiedStep(currentStepIndex);
      if (sessionStorageKey && typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(sessionStorageKey, String(currentStepIndex));
        } catch {
          // Ignore storage failures (e.g., private mode)
        }
      }

      onRequire2FA(false);
      onLoginSuccess();
      resetTwoFactorState();
    } catch (err) {
      const message = err instanceof Error ? err.message : '2FA verification failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTwoFactor = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to cancel 2FA, please try again.';
      setError(message);
    } finally {
      onRequire2FA(false);
      resetTwoFactorState();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Pháº§n bÃªn trÃ¡i: Form Ä‘Äƒng nháº­p */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <div className="flex items-center gap-4">
              <HelpCircle className="w-5 h-5 text-gray-400 cursor-pointer" />
              <span className="text-sm text-gray-600">Don't have an account?</span>
              <button
                onClick={() => onNavigate('register')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Ä‘Äƒng nháº­p bÃ¬nh thÆ°á»ng */}
          {step === 'login' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
              <p className="text-gray-600 mb-8">Enter your personal details below to continue</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="ronaldrichards@pagedone.com"
                  value={email}
                  onChange={setEmail}
                  label="Email or Username"
                  required
                  icon="email"
                />

                <Input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={setPassword}
                  label="Password"
                  required
                  icon="password"
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-600">Keep me logged in</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Äang Ä‘Äƒng nháº­p...' : 'Login'}
                </Button>

                <div className="text-center text-gray-500 text-sm">OR</div>

                {/* Social login buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <span className="text-sm">Google</span>
                  </button>
                  <button type="button" className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <span className="text-sm">Facebook</span>
                  </button>
                  <button type="button" className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <span className="text-sm">Twitter</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form nháº­p mÃ£ 2FA */}
          {step === '2fa' && (
            <TwoFactorPrompt
              code={twoFactorCode}
              loading={loading}
              error={error}
              onCodeChange={setTwoFactorCode}
              onSubmit={handleVerifyTwoFactor}
              onCancel={handleCancelTwoFactor}
            />
          )}
        </div>
      </div>

      {/* Pháº§n bÃªn pháº£i: Dashboard preview */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="bg-gray-100 rounded-2xl p-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Team Briefing</p>
                    <p className="text-xs text-gray-500">09:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Control your Employees</h2>
            <p className="text-gray-600">
              With Our Smart Tool Invest intelligently and discover a better way to manage your entire Employees easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


