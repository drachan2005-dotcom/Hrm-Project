import { useEffect, useRef } from 'react';
import { Button } from '../Button';

interface TwoFactorPromptProps {
  code: string;
  loading: boolean;
  error?: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const OTP_LENGTH = 6;

/**
 * Giao diện nhập mã 2FA chia thành 6 ô riêng biệt (UI chuyên nghiệp).
 */
export function TwoFactorPrompt({
  code,
  loading,
  error,
  onCodeChange,
  onSubmit,
  onCancel,
}: TwoFactorPromptProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length: OTP_LENGTH }, () => null)
  );
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => code[i] ?? '');
  const isComplete = code.length === OTP_LENGTH;

  const updateCode = (nextDigits: string[]) => {
    const sanitized = nextDigits.join('').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onCodeChange(sanitized);
  };

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleInputChange = (index: number, rawValue: string) => {
    const cleanValue = rawValue.replace(/\D/g, '');
    const updated = [...digits];
    let cursor = index;
    if (!cleanValue) {
      updated[index] = '';
      updateCode(updated);
      return;
    }
    for (const char of cleanValue) {
      if (cursor >= OTP_LENGTH) break;
      updated[cursor++] = char;
    }
    updateCode(updated);
    focusInput(Math.min(cursor, OTP_LENGTH - 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const updated = [...digits];
      if (updated[index]) updated[index] = '';
      else if (index > 0) updated[index - 1] = '';
      updateCode(updated);
      focusInput(Math.max(index - 1, 0));
    }
    if (event.key === 'ArrowLeft') focusInput(Math.max(index - 1, 0));
    if (event.key === 'ArrowRight') focusInput(Math.min(index + 1, OTP_LENGTH - 1));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
    updateCode(updated);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  useEffect(() => {
    if (code.length === 0) focusInput(0);
  }, [code.length]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhập mã xác thực</h1>
      <p className="text-gray-600 mb-8">
        Mở ứng dụng Google Authenticator và nhập 6 số để hoàn tất đăng nhập.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isComplete && !loading) onSubmit();
        }}
        className="space-y-6"
      >
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-xl text-center font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          ))}
        </div>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={!isComplete || loading}>
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
