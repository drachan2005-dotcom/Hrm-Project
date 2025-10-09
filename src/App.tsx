// File chính của ứng dụng - Quản lý routing và authentication state
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  const awaiting2FARef = useRef(awaiting2FA);

  // State kiểm tra đang load session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    awaiting2FARef.current = awaiting2FA;
  }, [awaiting2FA]);

  const checkSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      const hasSession = Boolean(session);
      setIsAuthenticated(hasSession);

      if (hasSession) {
        if (!awaiting2FARef.current) {
          setCurrentPage('dashboard');
        }
      } else {
        setCurrentPage('login');
        setAwaiting2FA(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
      setAwaiting2FA(false);
      setCurrentPage('login');
    } finally {
      setLoading(false);
    }
  }, []);

  // Khi app khởi động, kiểm tra xem user đã đăng nhập chưa
  useEffect(() => {
    void checkSession();

    // Lắng nghe thay đổi authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);

      if (!session) {
        setAwaiting2FA(false);
        setCurrentPage('login');
        return;
      }

      if (!awaiting2FARef.current) {
        setCurrentPage('dashboard');
      }
    });

    // Cleanup subscription khi component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  // Hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAwaiting2FA(false);
    setCurrentPage('dashboard');
  };

  const handleRequire2FA = (value: boolean) => {
    setAwaiting2FA(value);
    if (value) {
      setCurrentPage('login');
    }
  };

  // Hàm xử lý khi đăng ký thành công
  const handleRegisterSuccess = () => {
    setAwaiting2FA(false);
    setCurrentPage('login');
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAwaiting2FA(false);
    setCurrentPage('login');
  };

  // Hàm điều hướng giữa các trang
  const handleNavigate = (page: Page) => {
    if (page !== 'dashboard') {
      setAwaiting2FA(false);
    }
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
      <div className={awaiting2FA || currentPage === 'login' ? 'block' : 'hidden'}>
        <Login
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
          onRequire2FA={handleRequire2FA}
        />
      </div>
      {currentPage === 'register' && (
        <Register
          onNavigate={handleNavigate}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword onNavigate={handleNavigate} />
      )}

      {currentPage === 'dashboard' && isAuthenticated && !awaiting2FA && (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;

