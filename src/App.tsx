// File chính của ứng dụng - Quản lý routing và authentication state
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Login, type LoginSuccessPayload } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import type { MockUser } from './lib/mockAuth';
import { isNetworkError } from './utils/network';

const HAS_SUPABASE_ENV = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Kiểu dữ liệu cho page hiện tại
type Page = 'login' | 'register' | 'forgot-password' | 'dashboard';

function App() {
  // State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState<Page>('login');

  // State kiểm tra user đã đăng nhập chưa
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'supabase' | 'mock'>(
    HAS_SUPABASE_ENV ? 'supabase' : 'mock'
  );
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  const awaiting2FARef = useRef(awaiting2FA);
  const isMountedRef = useRef(false);

  // State kiểm tra đang load session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    awaiting2FARef.current = awaiting2FA;
  }, [awaiting2FA]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const switchToMockMode = useCallback(() => {
    setAuthMode('mock');
    setSession(null);
    setMockUser(null);
    setIsAuthenticated(false);
    setAwaiting2FA(false);
  }, [setAuthMode, setSession, setMockUser, setIsAuthenticated, setAwaiting2FA]);

  const evaluateSession = useCallback(
    async (nextSession: Session | null) => {
      try {
        if (!isMountedRef.current) {
          return;
        }

        setSession(nextSession);
        const hasSession = Boolean(nextSession);
        if (hasSession) {
          setAuthMode('supabase');
          setMockUser(null);
        }
        setIsAuthenticated(hasSession);

        if (!hasSession) {
          setAwaiting2FA(false);
          setCurrentPage('login');
          return;
        }

        if (awaiting2FARef.current) {
          setCurrentPage('login');
          return;
        }

        console.log('Session loaded:', nextSession.user?.email ?? 'unknown user');
        setAwaiting2FA(false);
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Session evaluation failed:', error);
        if (!isMountedRef.current) {
          return;
        }
        setIsAuthenticated(false);
        setAwaiting2FA(false);
        setCurrentPage('login');
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (authMode !== 'supabase') {
      setLoading(false);
      return;
    }

    let mounted = true;

    const handleInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (mounted && isMountedRef.current) {
          await evaluateSession(data?.session ?? null);
        }
      } catch (err) {
        console.error('Init session failed:', err);
        if (mounted && isMountedRef.current) {
          if (isNetworkError(err)) {
            switchToMockMode();
          } else {
            setIsAuthenticated(false);
            setAwaiting2FA(false);
          }
          setCurrentPage('login');
        }
      } finally {
        if (mounted && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    void handleInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted || !isMountedRef.current) {
        return;
      }

      console.log('Auth event:', event);
      await evaluateSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [authMode, evaluateSession, switchToMockMode]);

  const refreshSession = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (authMode !== 'supabase') {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }

      await evaluateSession(data?.session ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      if (!isMountedRef.current) {
        return;
      }
      if (isNetworkError(error)) {
        switchToMockMode();
      } else {
        setIsAuthenticated(false);
        setAwaiting2FA(false);
      }
      setCurrentPage('login');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [authMode, evaluateSession, switchToMockMode]);

  const handleLoginSuccess = (payload: LoginSuccessPayload) => {
    setAwaiting2FA(false);

    if (payload.mode === 'mock') {
      const user = payload.mockUser ?? null;
      switchToMockMode();
      setMockUser(user);
      const hasUser = Boolean(user);
      setIsAuthenticated(hasUser);
      setCurrentPage(hasUser ? 'dashboard' : 'login');
      setLoading(false);
      return;
    }

    setAuthMode('supabase');
    setMockUser(null);

    if (payload.session) {
      setLoading(true);
      void evaluateSession(payload.session);
    } else {
      void refreshSession();
    }
  };

  const handleRequire2FA = (value: boolean) => {
    setAwaiting2FA(value);
    if (value) {
      setCurrentPage('login');
    }
  };

  const handleRegisterSuccess = () => {
    setAwaiting2FA(false);
    setCurrentPage('login');
  };

  const handleRequireVerification = useCallback(() => {
    setAwaiting2FA(false);
    setCurrentPage('register');
  }, []);

  const handleLogout = useCallback(() => {
    setSession(null);
    setMockUser(null);
    setIsAuthenticated(false);
    setAwaiting2FA(false);
    setCurrentPage('login');
    setLoading(false);
  }, []);

  const handleNavigate = (page: Page) => {
    if (page !== 'dashboard') {
      setAwaiting2FA(false);
    }
    setCurrentPage(page);
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
    <>
      <div className={awaiting2FA || currentPage === 'login' ? 'block' : 'hidden'}>
        <Login
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
          onRequire2FA={handleRequire2FA}
          authMode={authMode}
        />
      </div>
      {currentPage === 'register' && (
        <Register
          onNavigate={handleNavigate}
          onRegisterSuccess={handleRegisterSuccess}
          authMode={authMode}
          onSwitchToMock={switchToMockMode}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword onNavigate={handleNavigate} />
      )}

      {currentPage === 'dashboard' &&
        !awaiting2FA &&
        ((authMode === 'supabase' && isAuthenticated) || (authMode === 'mock' && mockUser)) && (
        <Dashboard
          session={session}
          authLoading={loading}
          onLogout={handleLogout}
          onRequireVerification={handleRequireVerification}
          authMode={authMode}
          mockUser={mockUser}
        />
      )}
    </>
  );
}

export default App;
