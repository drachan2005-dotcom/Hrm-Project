// Trang dashboard sau khi đăng nhập thành công
import { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';
import { LogOut, User, Calendar, BarChart3, Settings } from 'lucide-react';
import type { Profile } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  // State lưu thông tin profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile khi component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Hàm load profile từ database
  const loadProfile = async () => {
    try {
      // Lấy user hiện tại
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        onLogout();
        return;
      }

      // Load profile từ database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

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
                <p className="text-sm text-gray-500">@{profile?.username}</p>
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
            Chào mừng, {profile?.full_name}! 👋
          </h1>
          <p className="text-gray-600">
            Đây là dashboard của bạn. Hệ thống đã hoàn tất KYC và sẵn sàng sử dụng.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-sm text-gray-600">Upcoming Tasks</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">86%</h3>
            <p className="text-sm text-gray-600">Performance</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-3%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-sm text-gray-600">Team Members</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="font-medium text-gray-900">{profile?.full_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Username</p>
                <p className="font-medium text-gray-900">@{profile?.username}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="font-medium text-gray-900">{profile?.phone_number || 'Chưa cập nhật'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Vai trò</p>
                <p className="font-medium text-gray-900 capitalize">{profile?.role_preference}</p>
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
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.kyc_completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {profile?.kyc_completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Xác thực 2 yếu tố (2FA)</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.two_fa_enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile?.two_fa_enabled ? 'Đã bật' : 'Chưa bật'}
                </span>
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
                  {new Date(profile?.created_at || '').toLocaleDateString('vi-VN')}
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
                  {new Date(profile?.created_at || '').toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
