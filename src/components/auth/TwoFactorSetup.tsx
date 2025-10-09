import { useEffect, useRef, useState } from 'react';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '../Button';
import { supabase } from '../../lib/supabase';

interface TwoFactorSetupProps {
  profileId: string;
  email: string;
  initialSecret?: string | null;
  onSecretGenerated?: (secret: string) => void;
  onComplete: (secret: string) => void;
  onCancel: () => void;
}

export function TwoFactorSetup({
  profileId,
  email,
  initialSecret,
  onSecretGenerated,
  onComplete,
  onCancel,
}: TwoFactorSetupProps) {
  const [secret, setSecret] = useState<string>(initialSecret ?? '');
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const secretRef = useRef(secret);

  useEffect(() => {
    if (initialSecret) {
      setSecret(initialSecret);
    }
  }, [initialSecret]);

  useEffect(() => {
    secretRef.current = secret;
  }, [secret]);

  useEffect(() => {
    let isMounted = true;

    const prepareQrCode = async () => {
      setError('');
      setLoading(true);

      try {
        const label = email?.trim() || 'user';
        const existingSecret = initialSecret ?? secretRef.current ?? '';
        const activeSecret = existingSecret
          ? OTPAuth.Secret.fromBase32(existingSecret)
          : new OTPAuth.Secret({ size: 20 });
        const secretString = activeSecret.base32;

        if (isMounted) {
          setSecret(secretString);
          secretRef.current = secretString;
          if (!existingSecret) {
            onSecretGenerated?.(secretString);
          }
        }

        const totp = new OTPAuth.TOTP({
          issuer: 'HRM Cloud',
          label,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: activeSecret,
        });

        const dataUrl = await QRCode.toDataURL(totp.toString(), {
          errorCorrectionLevel: 'M',
          margin: 2,
          scale: 6,
        });

        if (!isMounted) return;
        setQrCode(dataUrl);
      } catch (qrError) {
        console.error('Không thể tạo QR code 2FA:', qrError);
        if (!isMounted) return;
        setError('Không thể tạo QR code 2FA, vui lòng thử lại.');
        setQrCode('');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void prepareQrCode();

    return () => {
      isMounted = false;
    };
  }, [email, initialSecret, onSecretGenerated]);

  const handleConfirmSetup = async () => {
    if (!secret) {
      setError('No secret available yet. Please try again.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          two_fa_secret: secret,
          two_fa_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select('two_fa_enabled')
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data?.two_fa_enabled) {
        throw new Error('Enabling 2FA failed, please try again.');
      }

      onComplete(secret);
    } catch (setupError) {
      console.error('Error while saving 2FA secret:', setupError);
      const message =
        setupError instanceof Error ? setupError.message : 'Unable to enable 2FA, please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSetup = () => {
    setError('');
    onCancel();
  };

  return (
    <div className="border border-blue-100 rounded-xl bg-blue-50/60 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bước cuối: Kích hoạt xác thực 2FA</h3>
          <p className="text-sm text-gray-600">
            Quét mã QR bằng Google Authenticator (hoặc ứng dụng TOTP tương tự), sau đó xác nhận để lưu khóa bí mật. Scan
            this QR code with Google Authenticator (or any compatible TOTP app), then confirm to store your secret.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p>Generating QR code...</p>
        </div>
      ) : (
        <>
          {qrCode ? (
            <div className="flex flex-col items-center gap-4">
              <img src={qrCode} alt="QR code 2FA" className="w-48 h-48 shadow-lg rounded-lg bg-white p-4" />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Can't scan the QR code? Enter the backup secret below:</p>
                <code className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-mono tracking-wide text-gray-800">
                  {secret}
                </code>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <XCircle className="w-4 h-4" />
              <span>Unable to display the QR code right now. Please try again later.</span>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          <XCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={handleConfirmSetup} disabled={saving || loading || !qrCode}>
          {saving ? 'Saving secret...' : 'I have scanned and saved the code'}
        </Button>
        <Button variant="secondary" onClick={handleCancelSetup} disabled={saving}>
          Cancel setup
        </Button>
      </div>
    </div>
  );
}




