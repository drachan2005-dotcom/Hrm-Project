import { useState } from 'react';
import { Plus, Key, Smartphone } from 'lucide-react';

interface SecuritySettings {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  recoveryEmail: string;
  recoveryPhone: string;
}

export default function SecurityPrivacy() {
  const [settings, setSettings] = useState<SecuritySettings>({
    emailVerified: true,
    twoFactorEnabled: true,
    recoveryEmail: 'info@pagedone.com',
    recoveryPhone: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof SecuritySettings, value: string | boolean) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleCancel = () => {
    setSettings({
      emailVerified: true,
      twoFactorEnabled: true,
      recoveryEmail: 'info@pagedone.com',
      recoveryPhone: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Security & Privacy</h2>
          <p className="text-sm text-gray-500 mt-1">Manage Security & Privacy settings to protect your account</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Account Details</h3>

            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Verify Email Address</h4>
                <p className="text-sm text-gray-500 mt-1">Verify Your email address to confirm the credentials</p>
              </div>
              {settings.emailVerified && (
                <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                  Verified
                </span>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">Update Password</h4>
                  <p className="text-sm text-gray-500 mt-1">Change your password to update & protect your Account</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-900 rounded-lg hover:bg-gray-50">
                  Change Password
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 pt-4">Recovery Settings</h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Recovery Email Address</h4>
                <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                  Save
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">Setup Recovery Email to Secure your Account</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Another Email Address
                </label>
                <input
                  type="email"
                  value={settings.recoveryEmail}
                  onChange={(e) => handleChange('recoveryEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Recovery Phone Number</h4>
                <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-900 rounded-lg hover:bg-gray-50">
                  Setup
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">Add Phone number to Setup SMS Recovery for your account</p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Deactivate Account</h3>
              <p className="text-sm text-gray-500 mb-4">This will shut down your account, And it will reactivate with Signing in</p>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                Deactivate
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Two-factor Authentication</h3>

            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Enable Authentication</h4>
                <p className="text-sm text-gray-500 mt-1">Enable Two-factor Authentication to enhance the security</p>
              </div>
              <button
                onClick={() => handleChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.twoFactorEnabled && (
              <>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">Authentication App</span>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Security Key</h4>
                        <p className="text-sm text-gray-500">Use physical security key to protect your account</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-900 rounded-lg hover:bg-gray-50">
                    Use Security Key
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
