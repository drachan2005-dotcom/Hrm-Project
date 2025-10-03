// Trang quên mật khẩu
import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HelpCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  // State quản lý bước: 'email' hoặc 'reset'
  const [step, setStep] = useState<'email' | 'reset'>('email');

  // State lưu email
  const [email, setEmail] = useState('');

  // State lưu mật khẩu mới
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm gửi email reset password
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Gửi email reset password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess('Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');

      // Trong demo này, chuyển luôn sang bước reset
      setTimeout(() => {
        setStep('reset');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi email');
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate password
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      // Cập nhật mật khẩu mới
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess('Đổi mật khẩu thành công!');

      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Phần bên trái: Form */}
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

          {/* Form nhập email */}
          {step === 'email' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
              <p className="text-gray-600 mb-8">Please enter your registered email ID</p>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <Input
                  type="email"
                  placeholder="ronaldrichards@pagedone.com"
                  value={email}
                  onChange={setEmail}
                  label="Email or Username"
                  required
                  icon="email"
                />

                <p className="text-sm text-gray-600">
                  We will send a verification code to your registered email ID
                </p>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Next'}
                </Button>

                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Quay lại đăng nhập
                </button>
              </form>
            </div>
          )}

          {/* Form nhập mật khẩu mới */}
          {step === 'reset' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">New Password</h1>
              <p className="text-gray-600 mb-8">Please enter a new password</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={setNewPassword}
                  label="New Password"
                  required
                  icon="password"
                />

                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Re-enter Password"
                  required
                  icon="password"
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Change Password'}
                </Button>
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
