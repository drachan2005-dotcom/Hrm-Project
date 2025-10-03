// Trang đăng nhập với 2FA
import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HelpCircle } from 'lucide-react';
import { TwoFactorPrompt } from '../components/auth/TwoFactorPrompt';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;
}

type LoginStep = 'login' | '2fa';

export function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  // State để lưu email và password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State để quản lý bước đăng nhập (bình thường hoặc 2FA)
  const [step, setStep] = useState<LoginStep>('login');

  // State để lưu mã 2FA người dùng nhập và mã mock được tạo
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // State để hiển thị lỗi và trạng thái loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm đặt lại trạng thái 2FA khi người dùng hủy hoặc xác thực thành công
  const resetTwoFactorState = () => {
    setTwoFactorCode('');
    setGeneratedCode('');
    setStep('login');
  };

  // Hàm xử lý đăng nhập
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Đăng nhập với Supabase bằng email và mật khẩu
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const user = data.user;
      if (!user) throw new Error('Không tìm thấy thông tin người dùng');

      // Kiểm tra cờ 2FA trong metadata của user
      const isTwoFactorEnabled = Boolean(user.user_metadata?.is2FAEnabled);

      if (isTwoFactorEnabled) {
        // Nếu bật 2FA: tạo mã mock 6 số và chuyển sang bước nhập mã
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        setTwoFactorCode('');
        setStep('2fa');

        // Demo tạm thời: in mã ra console để QA có thể thử
        console.log('Mã 2FA (demo):', code);
        return;
      }

      // Nếu chưa bật 2FA thì hoàn tất đăng nhập luôn
      onLoginSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xác thực mã 2FA
  const handleVerifyTwoFactor = async () => {
    setError('');

    // Kiểm tra định dạng mã 2FA (phải đủ 6 chữ số)
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setError('Vui lòng nhập đủ 6 số của mã 2FA');
      return;
    }

    setLoading(true);
    try {
      if (twoFactorCode === generatedCode) {
        // Đúng mã thì cho phép điều hướng vào Dashboard
        onLoginSuccess();
        resetTwoFactorState();
      } else {
        throw new Error('Mã 2FA không chính xác');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xác thực 2FA thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng muốn quay lại bước đăng nhập
  const handleCancelTwoFactor = async () => {
    setError('');
    resetTwoFactorState();
    await supabase.auth.signOut();
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

          {/* Form nhập mã 2FA */}
          {step === '2fa' && (
            <TwoFactorPrompt
              code={twoFactorCode}
              loading={loading}
              error={error}
              demoCode={generatedCode}
              onCodeChange={setTwoFactorCode}
              onSubmit={handleVerifyTwoFactor}
              onCancel={handleCancelTwoFactor}
            />
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
