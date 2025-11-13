// File này định nghĩa các kiểu dữ liệu sử dụng trong app

// Kiểu dữ liệu cho thông tin profile người dùng
export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  phone?: string;
  department?: string;
  position?: string;
  description?: string;
  two_fa_enabled: boolean;
  two_fa_secret?: string | null;
  kyc_completed: boolean;
  created_at?: string;
  updated_at?: string;
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

// Kiểu dữ liệu mô tả một nhân sự trong dashboard
export interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  department: string;
  position: string;
  role: string;
  mobile_number: string;
  join_date: string;
  status: 'Active' | 'Inactive' | 'Onboarding' | string;
}

// Bản ghi điểm danh mô phỏng
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  status: 'Present' | 'Absent' | 'On Leave' | string;
  date: string;
}

// Lịch làm việc sắp tới
export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: 'Critical' | 'Urgent' | 'Routine' | string;
  assigned_to: string;
  start_time: string;
  end_time: string;
}

// Thông báo nội bộ
export interface Announcement {
  id: string;
  title: string;
  description: string;
  published_at: string;
}

export interface DocumentRecord {
  id: string;
  employee_id: string;
  file_size: number;
  storage_percentage: number;
  last_modified: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  status: 'Approve' | 'Pending' | 'Rejected' | string;
  start_date: string;
  end_date: string;
  days_left?: number;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  department: string;
  period: string;
  end_date: string;
  salary: number;
  status: 'Completed' | 'Pending' | string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  color: string;
  start_time: string;
  end_time: string;
}

