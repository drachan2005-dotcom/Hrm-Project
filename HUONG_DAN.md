# Hướng dẫn sử dụng ứng dụng Pagedone

## Giới thiệu

Đây là ứng dụng quản lý nhân viên với đầy đủ tính năng:
- ✅ Đăng ký tài khoản với quy trình KYC 4 bước
- ✅ Đăng nhập với xác thực 2 yếu tố (2FA)
- ✅ Quên mật khẩu và reset
- ✅ Dashboard hiển thị thông tin cá nhân

## Cấu trúc code

```
src/
├── components/          # Các component tái sử dụng
│   ├── Logo.tsx        # Component logo
│   ├── Input.tsx       # Component input với icon
│   └── Button.tsx      # Component button
│
├── pages/              # Các trang chính
│   ├── Login.tsx       # Trang đăng nhập (có 2FA)
│   ├── Register.tsx    # Trang đăng ký (4 bước KYC)
│   ├── ForgotPassword.tsx  # Trang quên mật khẩu
│   └── Dashboard.tsx   # Trang dashboard sau khi login
│
├── lib/
│   └── supabase.ts     # Khởi tạo Supabase client
│
├── types/
│   └── index.ts        # Định nghĩa các kiểu dữ liệu
│
└── App.tsx             # File chính, quản lý routing
```

## Giải thích code đơn giản

### 1. App.tsx - File chính
- Quản lý **state** (trạng thái) của app: trang nào đang hiển thị, user đã login chưa
- Sử dụng `useState` để lưu trữ dữ liệu
- Sử dụng `useEffect` để chạy code khi app khởi động
- Render (hiển thị) trang phù hợp dựa vào state

### 2. Login.tsx - Trang đăng nhập
- Có 2 bước:
  - Bước 1: Nhập email và password
  - Bước 2 (nếu có 2FA): Nhập mã OTP 4 số
- Demo: Mã OTP là **1590**
- Sử dụng `supabase.auth.signInWithPassword()` để đăng nhập

### 3. Register.tsx - Trang đăng ký
- Có 4 bước KYC:
  - Bước 1: Thông tin cá nhân (tên, email, SĐT)
  - Bước 2: Chọn vai trò (Employee hoặc Manager)
  - Bước 3: Chọn phòng ban và chức vụ
  - Bước 4: Tạo username và password
- Sau khi hoàn thành, hiển thị màn hình thành công
- Sử dụng `supabase.auth.signUp()` để tạo tài khoản

### 4. ForgotPassword.tsx - Quên mật khẩu
- Có 2 bước:
  - Bước 1: Nhập email
  - Bước 2: Nhập mật khẩu mới
- Sử dụng `supabase.auth.resetPasswordForEmail()` để gửi email

### 5. Dashboard.tsx - Trang dashboard
- Hiển thị thông tin profile của user
- Load dữ liệu từ database bằng `supabase.from('profiles').select()`
- Có nút đăng xuất

## Các khái niệm quan trọng

### State (useState)
```typescript
const [email, setEmail] = useState('');
```
- `email`: Biến lưu giá trị
- `setEmail`: Hàm để thay đổi giá trị
- Khi state thay đổi, component sẽ re-render (vẽ lại)

### Props
```typescript
interface LoginProps {
  onNavigate: (page: string) => void;
}
```
- Props là dữ liệu truyền từ component cha sang component con
- Giống như tham số của function

### useEffect
```typescript
useEffect(() => {
  // Code chạy khi component mount (khởi tạo)
  loadProfile();
}, []); // [] nghĩa là chỉ chạy 1 lần
```

### Async/Await
```typescript
const handleLogin = async () => {
  const { data, error } = await supabase.auth.signIn();
  // Đợi cho đến khi có kết quả
};
```

## Làm thế nào để chỉnh sửa?

### Thay đổi màu chủ đạo
Tìm tất cả `blue-600` và đổi thành màu khác:
- `red-600`: Màu đỏ
- `green-600`: Màu xanh lá
- `purple-600`: Màu tím

### Thêm field mới vào form đăng ký
1. Mở `src/types/index.ts`
2. Thêm field vào interface tương ứng
3. Mở `src/pages/Register.tsx`
4. Thêm `<Input>` mới vào form
5. Update state với field mới

### Thay đổi số bước đăng ký
1. Mở `src/pages/Register.tsx`
2. Tìm biến `steps` (dòng ~40)
3. Thêm/bớt bước trong array
4. Tạo form mới cho bước đó

## Database

### Bảng profiles
Lưu thông tin user:
- `full_name`: Họ tên
- `username`: Tên đăng nhập
- `phone_number`: SĐT
- `role_preference`: Vai trò
- `department`: Phòng ban
- `position`: Chức vụ
- `kyc_completed`: Đã KYC chưa
- `two_fa_enabled`: Có bật 2FA không

## Lưu ý quan trọng

1. **Mã OTP demo**: Trong thực tế cần tích hợp dịch vụ gửi SMS/Email
2. **2FA**: Hiện tại là fake, trong production cần dùng thư viện như `speakeasy`
3. **Validation**: Nên thêm nhiều validation hơn (regex email, độ mạnh password...)
4. **Error handling**: Hiện tại đơn giản, có thể cải thiện với toast notifications

## Cách test ứng dụng

1. Chạy dev server (đã tự động chạy sẵn)
2. Mở trang đăng ký
3. Điền form 4 bước
4. Quay lại trang login
5. Đăng nhập (nếu có 2FA thì nhập OTP: 1590)
6. Xem dashboard

## Học thêm

- React hooks: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs

## Mở rộng ứng dụng

Một số tính năng có thể thêm:
- [ ] Upload avatar
- [ ] Chỉnh sửa profile
- [ ] Thêm thành viên vào team
- [ ] Quản lý lịch làm việc
- [ ] Chat giữa các thành viên
- [ ] Notifications
