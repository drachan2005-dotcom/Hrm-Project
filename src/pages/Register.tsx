import { useState, useRef, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { TwoFactorPrompt } from '../components/auth/TwoFactorPrompt';
import { supabase } from '../lib/supabase';
import { createMockUser, mockUserExistsByPhone } from '../lib/mockAuth';
import { HelpCircle, ChevronRight, User, Briefcase, Settings, BadgeCheck, Mail } from 'lucide-react';
import type { RegisterStep1Data, RegisterStep2Data, RegisterStep3Data, RegisterStep4Data } from '../types';
import { isNetworkError } from '../utils/network';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0[0-9]{9})$/;
const OTP_CODE_LENGTH = 6;
const LOCAL_OTP_VALIDITY_MS = 5 * 60 * 1000;
const HAS_SUPABASE_ENV = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

function generateMockOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendMockOtp(phone: string) {
  const otp = generateMockOtp();
  console.log(`[Mock OTP] Sent code ${otp} to ${phone}`);
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    otp,
    expiresAt: Date.now() + LOCAL_OTP_VALIDITY_MS,
  };
}

async function ensureProfileExists(userId: string, defaultProfile: Record<string, unknown>) {
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId);

  if (selectError) {
    console.warn('Profile check error:', selectError.message ?? selectError);
    return;
  }

  if (!existing || existing.length === 0) {
    const { error: insertError } = await supabase.from('profiles').insert(defaultProfile);
    if (insertError) {
      console.error('Insert profile failed:', insertError.message ?? insertError);
    }
  }
}

async function updateProfile(profileId: string, updates: Record<string, unknown>) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId);

  if (profileError) {
    console.error('Error updating profile:', profileError.message ?? profileError);
    throw profileError;
  }
}

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: () => void;
  authMode: 'supabase' | 'mock';
  onSwitchToMock: () => void;
}

export function Register({ onNavigate, onRegisterSuccess, authMode, onSwitchToMock }: RegisterProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<RegisterStep1Data>({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  const [step2Data, setStep2Data] = useState<RegisterStep2Data>({
    rolePreference: 'employee',
  });

  const [step3Data, setStep3Data] = useState<RegisterStep3Data>({
    department: '',
    position: '',
    description: '',
  });

  const [step4Data, setStep4Data] = useState<RegisterStep4Data>({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [verifiedEmailValue, setVerifiedEmailValue] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhoneValue, setVerifiedPhoneValue] = useState<string | null>(null);
  const [pendingPhoneValue, setPendingPhoneValue] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [step1Notice, setStep1Notice] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mockOtpPreview, setMockOtpPreview] = useState<string | null>(null);

  const currentEmailValue = step1Data.email.trim();
  const isEmailFormatValid = EMAIL_REGEX.test(currentEmailValue);
  const formattedPhoneCandidate = step1Data.phoneNumber.trim()
    ? `+84${step1Data.phoneNumber.trim()}`
    : null;
  const isEmailCurrentlyVerified =
    emailVerified && verifiedEmailValue === currentEmailValue;
  const isPhoneCurrentlyVerified =
    phoneVerified && verifiedPhoneValue === formattedPhoneCandidate;
  const isStep1Processing = otpSending || otpLoading || checkingEmail;
  const shouldUseSupabase = HAS_SUPABASE_ENV && authMode === 'supabase';

  const steps = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Role Preference', icon: Briefcase },
    { number: 3, title: 'Select Designation', icon: Settings },
    { number: 4, title: 'Setup An Account', icon: BadgeCheck },
  ];

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const resetOtpState = () => {
    setAwaitingOtp(false);
    setOtpCode('');
    setOtpError('');
    setOtpLoading(false);
    setGeneratedOtp(null);
    setOtpExpiresAt(null);
    setPendingPhoneValue(null);
    setOtpVerified(false);
    setCooldown(0);
    setMockOtpPreview(null);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  };

  const handleFullNameChange = (value: string) => {
    setStep1Data((prev) => ({ ...prev, fullName: value }));
  };

  const handleEmailChange = (value: string) => {
    setStep1Data((prev) => ({ ...prev, email: value }));
    setEmailVerified(false);
    setVerifiedEmailValue(null);
    setEmailError('');
    setEmailAvailable(false);
    setEmailCheckMessage('');
    setStep1Notice('');
    setCheckingEmail(false);
    setError('');
  };

  const handleEmailBlur = () => {
    const trimmedValue = step1Data.email.trim();

    if (!trimmedValue) {
      setEmailVerified(false);
      setEmailAvailable(false);
      setEmailError('');
      setCheckingEmail(false);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedValue)) {
      setEmailVerified(false);
      setVerifiedEmailValue(null);
      setEmailAvailable(false);
      setEmailError('Email khÃ´ng há»£p lá»‡.');
      setEmailCheckMessage('');
      setCheckingEmail(false);
      return;
    }

    setEmailVerified(true);
    setVerifiedEmailValue(trimmedValue);
    setEmailAvailable(true);
    setEmailCheckMessage('Email há»£p lá»‡.');
    setEmailError('');
    setCheckingEmail(false);
  };

  const handlePhoneChange = (value: string) => {
    setStep1Data((prev) => ({ ...prev, phoneNumber: value }));
    setPhoneVerified(false);
    setVerifiedPhoneValue(null);
    setStep1Notice('');
    resetOtpState();
  };

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    cooldownTimerRef.current = timer;
  };

  const handleRequestOtp = async () => {
    setOtpError('');
    setStep1Notice('');
    setMockOtpPreview(null);

    const rawPhone = step1Data.phoneNumber.trim();
    if (!PHONE_REGEX.test(rawPhone)) {
      setOtpError('Please enter a valid phone number.');
      return;
    }

    const formattedPhone = `+84${rawPhone}`;
    setOtpSending(true);

    try {
      let usingSupabaseThisAttempt = shouldUseSupabase;

      if (shouldUseSupabase) {
        try {
          const {
            data: existingProfile,
            error: phoneLookupError,
          } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone_number', formattedPhone)
            .maybeSingle();

          if (phoneLookupError) {
            if (isNetworkError(phoneLookupError)) {
              console.warn(
                'Phone lookup skipped due to network error:',
                phoneLookupError.message ?? phoneLookupError
              );
              onSwitchToMock();
              usingSupabaseThisAttempt = false;
            } else {
              const message =
                phoneLookupError.message ?? 'Unable to verify phone number. Please try again.';
              setOtpError(message);
              return;
            }
          }

          if (existingProfile) {
            setOtpError('Phone number already registered. Please use a different number.');
            return;
          }
        } catch (err) {
          if (isNetworkError(err)) {
            console.warn('Supabase phone lookup failed, switching to mock mode:', err);
            onSwitchToMock();
            usingSupabaseThisAttempt = false;
          } else {
            const message = err instanceof Error ? err.message : 'Unable to verify phone number.';
            setOtpError(message);
            return;
          }
        }
      }

      if (mockUserExistsByPhone(formattedPhone)) {
        setOtpError('Phone number already registered. Please use a different number.');
        return;
      }

      const { otp, expiresAt } = await sendMockOtp(formattedPhone);
      setGeneratedOtp(otp);
      setOtpExpiresAt(expiresAt);
      setPendingPhoneValue(formattedPhone);
      setAwaitingOtp(true);
      setOtpCode('');
      setOtpVerified(false);
      setMockOtpPreview(otp);
      setStep1Notice(
        usingSupabaseThisAttempt
          ? 'OTP da duoc gui. Vui long nhap 6 so de xac minh.'
          : `Che do offline: su dung ma ${otp} de xac minh.`
      );
      startCooldown(60);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP.';
      setOtpError(message);
    } finally {
      setOtpSending(false);
    }
  };
  const handleOtpSubmit = () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      if (!generatedOtp || !pendingPhoneValue || !otpExpiresAt) {
        setOtpError('Please request a new OTP.');
        return;
      }

      if (Date.now() > otpExpiresAt) {
        setOtpError('OTP has expired, request a new one.');
        resetOtpState();
        return;
      }

      if (otpCode.trim().length !== OTP_CODE_LENGTH) {
        setOtpError(`Enter the ${OTP_CODE_LENGTH}-digit code.`);
        return;
      }

      if (otpCode.trim() !== generatedOtp) {
        setOtpError('Incorrect OTP, please try again.');
        return;
      }

      setPhoneVerified(true);
      setVerifiedPhoneValue(pendingPhoneValue);
      setAwaitingOtp(false);
      setOtpCode('');
      setStep1Notice('Phone number verified successfully.');
      setOtpVerified(true);
      setMockOtpPreview(null);
      setCooldown(0);
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpCancel = () => {
    resetOtpState();
    setOtpError('');
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (checkingEmail) {
      setError('Äang kiá»ƒm tra email, vui lÃ²ng Ä‘á»£i.');
      return;
    }

    if (emailError) {
      setError(emailError);
      return;
    }

    if (!step1Data.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!isEmailCurrentlyVerified) {
      setError('Enter a valid email address.');
      return;
    }

    if (!formattedPhoneCandidate) {
      setError('Please enter a phone number.');
      return;
    }

    if (!isPhoneCurrentlyVerified) {
      setError('Verify your phone number via OTP before continuing.');
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!step2Data.rolePreference) {
      setError('Please choose a role.');
      return;
    }

    setCurrentStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!step3Data.department || !step3Data.position) {
      setError('Please complete department and position.');
      return;
    }

    setCurrentStep(4);
  };

  const registerWithMock = () => {
    const phoneValue = verifiedPhoneValue ?? formattedPhoneCandidate;
    if (!phoneValue) {
      return {
        success: false,
        error: 'Verify your phone number before creating an account.',
      };
    }

    const usernameValue =
      step4Data.username.trim() || step1Data.email.trim().split('@')[0];

    const result = createMockUser({
      email: step1Data.email.trim(),
      username: usernameValue,
      password: step4Data.password,
      fullName: step1Data.fullName.trim(),
      phoneNumber: phoneValue,
      rolePreference: step2Data.rolePreference,
      department: step3Data.department,
      position: step3Data.position,
      description: step3Data.description,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    setError('');
    setCurrentStep(5);
    onRegisterSuccess();
    return { success: true };
  };

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (step4Data.password !== step4Data.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (step4Data.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (!isEmailCurrentlyVerified) {
      setError('Verify your email before creating an account.');
      setLoading(false);
      return;
    }

    if (!formattedPhoneCandidate || !isPhoneCurrentlyVerified) {
      setError('Verify your phone number before creating an account.');
      setLoading(false);
      return;
    }

    if (!shouldUseSupabase) {
      onSwitchToMock();
      const { success, error: mockError } = registerWithMock();
      if (!success && mockError) {
        setError(mockError);
      }
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step4Data.password,
      });

      if (signUpError) throw signUpError;

      const supabaseUser = authData.user;
      if (!supabaseUser) throw new Error('Unable to create account.');

      const nowIso = new Date().toISOString();
      const phoneValue = verifiedPhoneValue ?? formattedPhoneCandidate;

      const defaultProfile = {
        id: supabaseUser.id,
        full_name: step1Data.fullName,
        username: step4Data.username || step1Data.email.split('@')[0],
        phone_number: phoneValue,
        role_preference: step2Data.rolePreference,
        department: step3Data.department,
        position: step3Data.position,
        description: step3Data.description,
        kyc_completed: false,
        two_fa_enabled: false,
        two_fa_secret: null,
        created_at: nowIso,
        updated_at: nowIso,
      };

      await ensureProfileExists(supabaseUser.id, defaultProfile);

      await updateProfile(supabaseUser.id, {
        full_name: defaultProfile.full_name,
        username: defaultProfile.username,
        phone_number: defaultProfile.phone_number,
        role_preference: defaultProfile.role_preference,
        department: defaultProfile.department,
        position: defaultProfile.position,
        description: defaultProfile.description,
        updated_at: nowIso,
      });

      setCurrentStep(5);
      onRegisterSuccess();
    } catch (err) {
      if (isNetworkError(err)) {
        onSwitchToMock();
        const { success, error: mockError } = registerWithMock();
        if (success) {
          return;
        }
        if (mockError) {
          setError(mockError);
        } else {
          setError('Unable to connect to Supabase. Check .env configuration.');
        }
      } else {
        const message = err instanceof Error ? err.message : 'Registration failed.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex items-center gap-4">
            <HelpCircle className="w-5 h-5 text-gray-400 cursor-pointer" />
            <span className="text-sm text-gray-600">Already have an account?</span>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>

        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600">{step.title}</p>
                        <p className="text-xs text-gray-400">STEP {step.number} OF 4</p>
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit}>
              <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
              <p className="text-gray-600 mb-6">Enter your personal details below to continue</p>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Ronald Richards"
                  value={step1Data.fullName}
                  onChange={handleFullNameChange}
                  label="Full Name"
                  required
                  icon="user"
                />

                <Input
                  type="email"
                  placeholder="ronaldrichards@pagedone.com"
                  value={step1Data.email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  label="Email Address"
                  required
                  icon="email"
                />

                {checkingEmail && (
                  <p className="text-sm text-gray-500 mt-2">Äang kiá»ƒm tra...</p>
                )}
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                {!checkingEmail && !emailError && emailCheckMessage && (
                  <p className="text-sm text-gray-500 mt-2">{emailCheckMessage}</p>
                )}
                {!checkingEmail && !emailError && emailAvailable && (
                  <p className="text-sm text-green-600 mt-2">Email há»£p lá»‡ âœ“</p>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex gap-2 flex-1">
                      <select className="px-3 py-3 border border-gray-300 rounded-lg bg-white">
                        <option value="VN">VN</option>
                        <option value="IN">IN</option>
                        <option value="US">US</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="0123456789"
                        value={step1Data.phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRequestOtp}
                      disabled={
                        isStep1Processing ||
                        !isEmailFormatValid ||
                        cooldown > 0 ||
                        otpVerified
                      }
                    >
                      {otpVerified
                        ? 'OTP Ä‘Ã£ xÃ¡c nháº­n'
                        : otpSending
                        ? 'Sending OTP...'
                        : cooldown > 0
                        ? `Gá»­i láº¡i sau ${cooldown}s`
                        : awaitingOtp
                        ? 'Gá»­i láº¡i OTP'
                        : 'Gá»­i OTP'}
                    </Button>
                  </div>
                  {isPhoneCurrentlyVerified && (
                    <p className="text-sm text-green-600 mt-2">Phone number verified.</p>
                  )}
                  {otpVerified && (
                    <p className="text-sm text-green-600 mt-2">
                      âœ… OTP Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c minh, khÃ´ng cáº§n gá»­i láº¡i.
                    </p>
                  )}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {otpError && !awaitingOtp && (
                  <div className="text-red-500 text-sm mt-2">{otpError}</div>
                )}
                {step1Notice && <div className="text-blue-600 text-sm mt-2">{step1Notice}</div>}
                {mockOtpPreview && (
                  <div className="text-xs text-amber-600 mt-1">
                    Ma OTP thu nghiem:{' '}
                    <span className="font-mono font-semibold">{mockOtpPreview}</span>
                  </div>
                )}
                {awaitingOtp && (
                  <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <TwoFactorPrompt
                      code={otpCode}
                      loading={otpLoading}
                      error={otpError}
                      onCodeChange={(value) => setOtpCode(value)}
                      onSubmit={handleOtpSubmit}
                      onCancel={handleOtpCancel}
                      title="Nhap ma OTP"
                      description="Nhap 6 chu so duoc gui toi dien thoai cua ban."
                      confirmLabel="Xac minh OTP"
                      confirmLoadingLabel="Dang xac minh..."
                      cancelLabel="Huy yeu cau"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isStep1Processing}>
                    {isStep1Processing ? 'Verifying...' : 'Continue'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit}>
              <h2 className="text-2xl font-bold mb-2">Role Preference</h2>
              <p className="text-gray-600 mb-6">Select your role in the organization</p>

              <div className="space-y-4">
                <div
                  onClick={() => setStep2Data({ rolePreference: 'employee' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    step2Data.rolePreference === 'employee'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step2Data.rolePreference === 'employee' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <User
                        className={`w-5 h-5 ${
                          step2Data.rolePreference === 'employee' ? 'text-white' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">An Employee</h3>
                      <p className="text-sm text-gray-600">
                        Continue as an Employee in Pagedone HR.
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={step2Data.rolePreference === 'employee'}
                      onChange={() => setStep2Data({ rolePreference: 'employee' })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div
                  onClick={() => setStep2Data({ rolePreference: 'manager' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    step2Data.rolePreference === 'manager'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step2Data.rolePreference === 'manager' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <Briefcase
                        className={`w-5 h-5 ${
                          step2Data.rolePreference === 'manager' ? 'text-white' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">An Employer</h3>
                      <p className="text-sm text-gray-600">
                        Continue as an Employer in Pagedone HR.
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={step2Data.rolePreference === 'manager'}
                      onChange={() => setStep2Data({ rolePreference: 'manager' })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <Button type="submit">Continue</Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit}>
              <h2 className="text-2xl font-bold mb-2">Select Designation</h2>
              <p className="text-gray-600 mb-6">Select your position and department in the organization</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={step3Data.department}
                    onChange={(e) => setStep3Data({ ...step3Data, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={step3Data.position}
                    onChange={(e) => setStep3Data({ ...step3Data, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Product Designer">Product Designer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="HR Manager">HR Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={step3Data.description}
                    onChange={(e) => setStep3Data({ ...step3Data, description: e.target.value })}
                    placeholder="Enter a description..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                  />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <Button type="submit">Continue</Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleStep4Submit}>
              <h2 className="text-2xl font-bold mb-2">Setup An Account</h2>
              <p className="text-gray-600 mb-6">Select username and create a password to continue</p>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="@ronaldrich"
                  value={step4Data.username}
                  onChange={(val) => setStep4Data({ ...step4Data, username: val })}
                  label="Username"
                  required
                  icon="user"
                />

                <Input
                  type="password"
                  placeholder="********"
                  value={step4Data.password}
                  onChange={(val) => setStep4Data({ ...step4Data, password: val })}
                  label="Create Password"
                  required
                  icon="password"
                />

                <Input
                  type="password"
                  placeholder="Re-write Password"
                  value={step4Data.confirmPassword}
                  onChange={(val) => setStep4Data({ ...step4Data, confirmPassword: val })}
                  label="Confirm Password"
                  required
                  icon="password"
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Continue'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BadgeCheck className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-8">Welcome Aboard, Your Pagedone profile is created.</p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{step1Data.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="font-medium">{step4Data.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium">{step1Data.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{step3Data.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="font-medium">{step3Data.position}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="secondary">
                  Back
                </Button>
                <Button onClick={() => onNavigate('login')}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
