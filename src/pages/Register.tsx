// Trang đăng ký với 4 bước KYC
import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HelpCircle, ChevronRight, User, Briefcase, Settings, BadgeCheck, Mail } from 'lucide-react';
import type { RegisterStep1Data, RegisterStep2Data, RegisterStep3Data, RegisterStep4Data } from '../types';

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: () => void;
}

export function Register({ onNavigate, onRegisterSuccess }: RegisterProps) {
  // State quản lý bước hiện tại (1-4)
  const [currentStep, setCurrentStep] = useState(1);

  // State lưu dữ liệu từng bước
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

  // Các bước trong quy trình đăng ký
  const steps = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Role Preference', icon: Briefcase },
    { number: 3, title: 'Select Designation', icon: Settings },
    { number: 4, title: 'Setup An Account', icon: BadgeCheck },
  ];

  // Hàm xử lý submit bước 1
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate dữ liệu
    if (!step1Data.fullName || !step1Data.email || !step1Data.phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Chuyển sang bước 2
    setCurrentStep(2);
  };

  // Hàm xử lý submit bước 2
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!step2Data.rolePreference) {
      setError('Vui lòng chọn vai trò');
      return;
    }

    setCurrentStep(3);
  };

  // Hàm xử lý submit bước 3
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!step3Data.department || !step3Data.position) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setCurrentStep(4);
  };

  // Hàm xử lý submit bước 4 - Tạo tài khoản
  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password
    if (step4Data.password !== step4Data.confirmPassword) {
      setError('Mật khẩu không khớp');
      setLoading(false);
      return;
    }

    if (step4Data.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      // Bước 1: Đăng ký tài khoản với Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step4Data.password,
      });

      if (signUpError) throw signUpError;

      if (!authData.user) throw new Error('Không thể tạo tài khoản');

      // Bước 2: Tạo profile trong database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: step1Data.fullName,
          username: step4Data.username,
          phone_number: step1Data.phoneNumber,
          role_preference: step2Data.rolePreference,
          department: step3Data.department,
          position: step3Data.position,
          description: step3Data.description,
          kyc_completed: true,
          two_fa_enabled: false,
        });

      if (profileError) throw profileError;

      // Chuyển sang màn hình success
      setCurrentStep(5);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Hàm quay lại bước trước
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
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

        {/* Progress Indicator */}
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center">
                    {/* Step circle */}
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
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600">{step.title}</p>
                        <p className="text-xs text-gray-400">STEP {step.number} OF 4</p>
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Bước 1: Personal Details */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit}>
              <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
              <p className="text-gray-600 mb-6">Enter your personal details below to continue</p>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Ronald Richards"
                  value={step1Data.fullName}
                  onChange={(val) => setStep1Data({ ...step1Data, fullName: val })}
                  label="Full Name"
                  required
                  icon="user"
                />

                <Input
                  type="email"
                  placeholder="ronaldrichards@gmail.com"
                  value={step1Data.email}
                  onChange={(val) => setStep1Data({ ...step1Data, email: val })}
                  label="Email Address"
                  required
                  icon="email"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select className="px-3 py-3 border border-gray-300 rounded-lg bg-white">
                      <option>IN</option>
                      <option>VN</option>
                      <option>US</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="+84123456789"
                      value={step1Data.phoneNumber}
                      onChange={(e) => setStep1Data({ ...step1Data, phoneNumber: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
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

          {/* Bước 2: Role Preference */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit}>
              <h2 className="text-2xl font-bold mb-2">Role Preference</h2>
              <p className="text-gray-600 mb-6">Select your role in the organization</p>

              <div className="space-y-4">
                {/* Option: Employee */}
                <div
                  onClick={() => setStep2Data({ rolePreference: 'employee' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    step2Data.rolePreference === 'employee'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      step2Data.rolePreference === 'employee' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <User className={`w-5 h-5 ${
                        step2Data.rolePreference === 'employee' ? 'text-white' : 'text-gray-600'
                      }`} />
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

                {/* Option: Manager */}
                <div
                  onClick={() => setStep2Data({ rolePreference: 'manager' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    step2Data.rolePreference === 'manager'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      step2Data.rolePreference === 'manager' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <Briefcase className={`w-5 h-5 ${
                        step2Data.rolePreference === 'manager' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">An Employer</h3>
                      <p className="text-sm text-gray-600">
                        Continue as an Employee in Pagedone HR.
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

          {/* Bước 3: Select Designation */}
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
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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

          {/* Bước 4: Setup Account */}
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
                  placeholder="••••••••"
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
                    {loading ? 'Đang tạo tài khoản...' : 'Continue'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Bước 5: Success */}
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
