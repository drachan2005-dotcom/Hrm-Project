// File chính của ứng dụng - Quản lý routing và authentication state
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';

// Kiểu dữ liệu cho page hiện tại
type Page = 'login' | 'register' | 'forgot-password' | 'dashboard';

function App() {
  // State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState<Page>('login');

  // State kiểm tra user đã đăng nhập chưa
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State kiểm tra đang load session
  const [loading, setLoading] = useState(true);

  // Khi app khởi động, kiểm tra xem user đã đăng nhập chưa
  useEffect(() => {
    checkSession();

    // Lắng nghe thay đổi authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
    });

    // Cleanup subscription khi component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hàm kiểm tra session hiện tại
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  // Hàm xử lý khi đăng ký thành công
  const handleRegisterSuccess = () => {
    setCurrentPage('login');
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  // Hàm điều hướng giữa các trang
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // Hiển thị loading khi đang kiểm tra session
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

  // Render trang tương ứng dựa vào currentPage
  return (
    <>
      {currentPage === 'login' && (
        <Login
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'register' && (
        <Register
          onNavigate={handleNavigate}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword onNavigate={handleNavigate} />
      )}

      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
