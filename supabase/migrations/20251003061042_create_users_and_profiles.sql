/*
  # Tạo bảng dữ liệu cho hệ thống đăng ký và KYC
  
  ## Tables Mới
  
  ### `profiles`
  - `id` (uuid, primary key) - ID của user từ auth.users
  - `full_name` (text) - Họ và tên đầy đủ
  - `username` (text, unique) - Tên đăng nhập
  - `phone_number` (text) - Số điện thoại
  - `role_preference` (text) - Vai trò: 'employee' hoặc 'manager'
  - `department` (text) - Phòng ban
  - `position` (text) - Chức vụ
  - `description` (text) - Mô tả công việc
  - `kyc_completed` (boolean) - Đã hoàn thành KYC chưa
  - `two_fa_enabled` (boolean) - Đã bật 2FA chưa
  - `two_fa_secret` (text) - Mã bí mật cho 2FA (OTP)
  - `created_at` (timestamptz) - Thời gian tạo
  - `updated_at` (timestamptz) - Thời gian cập nhật
  
  ## Security
  - Enable RLS cho bảng profiles
  - Users chỉ có thể đọc và sửa profile của chính mình
*/

-- Tạo bảng profiles để lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  phone_number text,
  role_preference text DEFAULT 'employee',
  department text,
  position text,
  description text,
  kyc_completed boolean DEFAULT false,
  two_fa_enabled boolean DEFAULT false,
  two_fa_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bật Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: User có thể xem profile của chính họ
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: User có thể tạo profile của chính họ
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: User có thể cập nhật profile của chính họ
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động cập nhật updated_at khi có thay đổi
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();