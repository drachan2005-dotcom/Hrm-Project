// Trang đăng nhập với 2FA
import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HelpCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;
}

export function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  // State để lưu email và password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State để quản lý bước đăng nhập (bình thường hoặc 2FA)
  const [step, setStep] = useState<'login' | '2fa'>('login');

  // State để lưu mã OTP 2FA
  const [otpCode, setOtpCode] = useState(['', '', '', '']);

  // State để hiển thị lỗi
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // State lưu user ID tạm thời cho bước 2FA
  const [tempUserId, setTempUserId] = useState('');

  // Hàm xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Đăng nhập với Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Kiểm tra xem user có bật 2FA không
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_fa_enabled')
        .eq('id', data.user.id)
        .maybeSingle();

      // Nếu có 2FA thì chuyển sang bước nhập OTP
      if (profile?.two_fa_enabled) {
        setTempUserId(data.user.id);
        setStep('2fa');

        // Giả lập gửi OTP (trong thực tế sẽ gửi qua email/SMS)
        // Ở đây để demo, OTP luôn là "1590"
        console.log('OTP Code: 1590');
      } else {
        // Không có 2FA thì đăng nhập luôn
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý nhập OTP
  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Tự động focus sang ô tiếp theo
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Hàm xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otp = otpCode.join('');

    // Kiểm tra OTP có đủ 4 số không
    if (otp.length !== 4) {
      setError('Vui lòng nhập đủ 4 số');
      setLoading(false);
      return;
    }

    try {
      // Trong thực tế sẽ verify OTP với backend
      // Ở đây demo đơn giản: OTP đúng là "1590"
      if (otp === '1590') {
        onLoginSuccess();
      } else {
        throw new Error('Mã OTP không đúng');
      }
    } catch (err: any) {
      setError(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Phần bên trái: Form đăng nhập */}
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

          {/* Form đăng nhập bình thường */}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  label="Password"
                  required
                  icon="password"
                />

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

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
                  {loading ? 'Đang đăng nhập...' : 'Login'}
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

          {/* Form nhập OTP 2FA */}
          {step === '2fa' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
              <p className="text-gray-600 mb-8">
                Please enter your the verification code sent to your registered email ID
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 4 ô nhập OTP */}
                <div className="flex justify-center gap-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-gray-600">
                  We have sent a verification code to your registered email ID
                </p>

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang xác thực...' : 'Next'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Demo: Mã OTP là <span className="font-bold">1590</span>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Phần bên phải: Dashboard preview */}
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
