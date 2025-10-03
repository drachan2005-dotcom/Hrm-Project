// File này định nghĩa các kiểu dữ liệu sử dụng trong app

// Kiểu dữ liệu cho thông tin profile người dùng
export interface Profile {
  id: string;
  full_name: string;
  username: string;
  phone_number?: string;
  role_preference: 'employee' | 'manager';
  department?: string;
  position?: string;
  description?: string;
  kyc_completed: boolean;
  two_fa_enabled: boolean;
  two_fa_secret?: string;
  created_at: string;
  updated_at: string;
}

// Kiểu dữ liệu cho form đăng ký - Bước 1
export interface RegisterStep1Data {
  fullName: string;
  email: string;
  phoneNumber: string;
}

// Kiểu dữ liệu cho form đăng ký - Bước 2
export interface RegisterStep2Data {
  rolePreference: 'employee' | 'manager';
}

// Kiểu dữ liệu cho form đăng ký - Bước 3
export interface RegisterStep3Data {
  department: string;
  position: string;
  description: string;
}

// Kiểu dữ liệu cho form đăng ký - Bước 4
export interface RegisterStep4Data {
  username: string;
  password: string;
  confirmPassword: string;
}
