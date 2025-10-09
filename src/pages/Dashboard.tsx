// Trang dashboard sau khi đăng nhập thành công
import { useState, useEffect, useCallback } from 'react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';
import { LogOut, User, Calendar, BarChart3, Settings } from 'lucide-react';
import type { Profile } from '../types';
import { Button } from '../components/Button';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updatingTwoFactor, setUpdatingTwoFactor] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecretDraft, setTwoFactorSecretDraft] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [kycUpdating, setKycUpdating] = useState(false);
  const [kycError, setKycError] = useState('');
  const [kycSuccessMessage, setKycSuccessMessage] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        console.warn('loadProfile called without an authenticated user');
        const message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
        setAuthError(message);
        setProfile(null);
        setTwoFactorEnabled(false);
        setTwoFactorSecretDraft(null);
        return;
      }

      setAuthError('');
      setUserEmail(user.email ?? '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }

        const fallbackInsert = {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? '',
          username: user.email?.split('@')[0] ?? 'user',
          phone_number: user.user_metadata?.phone ?? '',
          department: '',
          position: '',
          description: '',
          kyc_completed: false,
          two_fa_enabled: false,
          two_fa_secret: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('profiles').insert([fallbackInsert]);
        if (insertError) throw insertError;

        const fallbackProfile: Profile = {
          id: fallbackInsert.id,
          full_name: fallbackInsert.full_name,
          username: fallbackInsert.username,
          phone: fallbackInsert.phone_number,
          department: fallbackInsert.department,
          position: fallbackInsert.position,
          description: fallbackInsert.description,
          kyc_completed: fallbackInsert.kyc_completed,
          two_fa_enabled: fallbackInsert.two_fa_enabled,
          two_fa_secret: fallbackInsert.two_fa_secret,
          created_at: fallbackInsert.created_at,
          updated_at: fallbackInsert.updated_at,
        };

        console.log('Created fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
        setTwoFactorEnabled(fallbackProfile.two_fa_enabled);
        setTwoFactorSecretDraft(fallbackProfile.two_fa_secret ?? null);
        return;
      }

      console.log('Loaded profile data:', data);

      if (!data) {
        console.warn(`No profile data returned for user ${user.id}`);
        return;
      }

      const mappedProfile: Profile = {
        id: data.id,
        full_name: data.full_name ?? undefined,
        username: data.username ?? undefined,
        phone: data.phone ?? data.phone_number ?? undefined,
        department: data.department ?? undefined,
        position: data.position ?? undefined,
        description: data.description ?? undefined,
        two_fa_enabled: Boolean(data.two_fa_enabled),
        two_fa_secret: data.two_fa_secret ?? null,
        kyc_completed: Boolean(data.kyc_completed),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProfile(mappedProfile);
      setTwoFactorEnabled(mappedProfile.two_fa_enabled);
      setTwoFactorSecretDraft(mappedProfile.two_fa_secret ?? null);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleStartTwoFactor = () => {
    setTwoFactorError('');
    if (!profile) {
      setTwoFactorError('Không tìm thấy hồ sơ, vui lòng thử lại.');
      return;
    }
    if (!userEmail) {
      setTwoFactorError('Tài khoản chưa có email, không thể bật 2FA.');
      return;
    }
    if (!profile.kyc_completed) {
      setTwoFactorError('Vui lòng hoàn thành KYC trước khi bật 2FA.');
      return;
    }
    setTwoFactorSecretDraft((current) => current ?? profile.two_fa_secret ?? null);
    setShowTwoFactorSetup(true);
  };

  const handleDisableTwoFactor = async () => {
    setTwoFactorError('');
    setUpdatingTwoFactor(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setTwoFactorError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        onLogout();
        return;
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ two_fa_enabled: false, two_fa_secret: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setTwoFactorEnabled(false);
      setTwoFactorSecretDraft(null);
      setProfile((prev) => (prev ? { ...prev, two_fa_enabled: false, two_fa_secret: null } : prev));
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      const message =
        error instanceof Error ? error.message : 'Tắt 2FA thất bại, vui lòng thử lại.';
      setTwoFactorError(message);
    } finally {
      setUpdatingTwoFactor(false);
    }
  };

  const handleTwoFactorSetupComplete = (secret: string) => {
    setTwoFactorError('');
    setShowTwoFactorSetup(false);
    setTwoFactorEnabled(true);
    setTwoFactorSecretDraft(secret);
    setProfile((prev) => (prev ? { ...prev, two_fa_enabled: true, two_fa_secret: secret } : prev));
  };

  const handleTwoFactorSetupCancel = () => {
    setShowTwoFactorSetup(false);
  };

  const handleMarkKycCompleted = async () => {
    if (kycUpdating) return;
    if (!profile) {
      setKycError('Không tìm thấy hồ sơ, vui lòng thử lại.');
      return;
    }
    setKycError('');
    setKycSuccessMessage('');
    setKycUpdating(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        console.warn('handleMarkKycCompleted called without an authenticated user');
        const message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
        setKycError(message);
        setAuthError(message);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ kyc_completed: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No profile data returned after KYC update.');
      }

      console.log('Updated profile after KYC:', data);

      const updatedProfile: Profile = {
        id: data.id,
        full_name: data.full_name ?? undefined,
        username: data.username ?? undefined,
        phone: data.phone ?? data.phone_number ?? undefined,
        department: data.department ?? undefined,
        position: data.position ?? undefined,
        description: data.description ?? undefined,
        two_fa_enabled: Boolean(data.two_fa_enabled),
        two_fa_secret: data.two_fa_secret ?? null,
        kyc_completed: Boolean(data.kyc_completed),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProfile(updatedProfile);
      setTwoFactorEnabled(updatedProfile.two_fa_enabled);
      setTwoFactorSecretDraft(updatedProfile.two_fa_secret ?? null);
      setKycSuccessMessage('Đã đánh dấu KYC hoàn thành.');
    } catch (error) {
      console.error('Error updating KYC status:', error);
      setKycError('Cập nhật KYC thất bại, vui lòng thử lại.');
    } finally {
      setKycUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Phiên đăng nhập đã hết hạn</h1>
          <p className="text-gray-600">{authError}</p>
          <Button onClick={handleLogout}>Đăng nhập lại</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                <p className="text-sm text-gray-500">@{profile?.username ?? 'user'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng, {profile?.full_name || 'bạn'}!
          </h1>
          <p className="text-gray-600">
            Đây là bảng điều khiển của bạn. Hoàn tất KYC để mở khóa toàn bộ tính năng của hệ thống.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-sm text-gray-600">Công việc sắp đến hạn</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+32%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-sm text-gray-600">Dự án đang hoạt động</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">76%</h3>
            <p className="text-sm text-gray-600">Điểm hiệu suất</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="font-medium text-gray-900">{profile?.full_name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tên đăng nhập</p>
                <p className="font-medium text-gray-900">@{profile?.username ?? 'user'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="font-medium text-gray-900">{profile?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Thông tin công việc
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Phòng ban</p>
                <p className="font-medium text-gray-900">{profile?.department || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Chức vụ</p>
                <p className="font-medium text-gray-900">{profile?.position || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                <p className="font-medium text-gray-900">{profile?.description || 'Chưa có mô tả'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái KYC</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.kyc_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {profile?.kyc_completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                </span>
                <div className="mt-3">
                  <Button
                    onClick={handleMarkKycCompleted}
                    variant="primary"
                    fullWidth={false}
                    disabled={!profile || loading || kycUpdating || profile.kyc_completed}
                  >
                    {kycUpdating ? 'Đang cập nhật...' : 'Đánh dấu KYC hoàn thành'}
                  </Button>
                  {kycError && <p className="text-sm text-red-500 mt-2">{kycError}</p>}
                  {kycSuccessMessage && <p className="text-sm text-green-600 mt-2">{kycSuccessMessage}</p>}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Xác thực 2 yếu tố (2FA)</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.two_fa_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                </span>
                <div className="mt-3 space-y-4">
                  {showTwoFactorSetup && profile && profile.kyc_completed ? (
                    <TwoFactorSetup
                      profileId={profile.id}
                      email={userEmail}
                      initialSecret={twoFactorSecretDraft ?? profile.two_fa_secret ?? null}
                      onSecretGenerated={setTwoFactorSecretDraft}
                      onComplete={handleTwoFactorSetupComplete}
                      onCancel={handleTwoFactorSetupCancel}
                    />
                  ) : (
                    <>
                      <Button
                        onClick={twoFactorEnabled ? handleDisableTwoFactor : handleStartTwoFactor}
                        variant={twoFactorEnabled ? 'secondary' : 'primary'}
                        fullWidth={false}
                        disabled={!profile?.kyc_completed || loading || updatingTwoFactor}
                      >
                        {updatingTwoFactor
                          ? 'Đang cập nhật...'
                          : twoFactorEnabled
                          ? 'Tắt xác thực 2FA'
                          : 'Bật xác thực 2FA'}
                      </Button>
                      {!profile?.kyc_completed && (
                        <p className="text-xs text-amber-500">
                          Hoàn thành KYC trước khi bật xác thực 2FA.
                        </p>
                      )}
                      {twoFactorError && <p className="text-sm text-red-500">{twoFactorError}</p>}
                      {!twoFactorEnabled && (
                        <p className="text-xs text-gray-500">
                          Sau khi bật, hệ thống sẽ cung cấp mã QR để quét bằng Google Authenticator.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Tài khoản được tạo</p>
                <p className="text-sm text-gray-500">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('vi-VN')
                    : 'Chưa xác định'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">KYC hoàn thành</p>
                <p className="text-sm text-gray-500">
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString('vi-VN')
                    : 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
