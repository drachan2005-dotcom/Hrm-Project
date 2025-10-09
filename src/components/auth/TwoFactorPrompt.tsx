// Form nhập mã 2FA hiển thị sau khi người dùng đăng nhập thành công bước 1
import { Button } from '../Button';

interface TwoFactorPromptProps {
  code: string;
  loading: boolean;
  error?: string;
  demoCode?: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TwoFactorPrompt({
  code,
  loading,
  error,
  demoCode,
  onCodeChange,
  onSubmit,
  onCancel,
}: TwoFactorPromptProps) {
  return (
    <div>
      {/* Tiêu đề và mô tả hướng dẫn nhập mã 2FA */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhập mã xác thực</h1>
      <p className="text-gray-600 mb-8">
        Vui lòng nhập mã 6 số chúng tôi vừa gửi (demo tạm thời hiển thị trong console) để tiếp tục.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="space-y-6"
      >
        {/* Ô nhập mã 2FA theo chuẩn Tailwind của dự án */}
        <input
          type="text"
          inputMode="numeric"
          pattern="\\d*"
          maxLength={6}
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className="w-full text-center text-2xl tracking-[0.4em] font-semibold border-2 border-gray-300 rounded-lg py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="●●●●●●"
        />

        {/* Hiển thị lỗi nếu người dùng nhập sai mã */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <div className="space-y-3">
          {/* Nút xác nhận mã 2FA */}
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </Button>

          {/* Nút quay lại để người dùng đăng nhập lại nếu cần */}
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Quay lại đăng nhập
          </Button>
        </div>

        {/* Ghi chú demo giúp QA biết mã mock đang dùng */}
        {demoCode && (
          <p className="text-center text-sm text-gray-500">
            Demo tạm thời: mã 2FA là <span className="font-semibold">{demoCode}</span>
          </p>
        )}
      </form>
    </div>
  );
}
