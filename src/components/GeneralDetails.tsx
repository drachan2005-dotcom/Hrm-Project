import { useState } from 'react';

interface GeneralSettings {
  email: string;
  country: string;
  language: string;
  timezone: string;
  time_format: string;
  website: string;
  theme: string;
  bio: string;
}

export default function GeneralDetails() {
  const [settings, setSettings] = useState<GeneralSettings>({
    email: 'ronaldrichards@gmail.com',
    country: 'India',
    language: 'English',
    timezone: 'UTC +05:30 - India Standard Time',
    time_format: '24 hours',
    website: 'Pagedone.com',
    theme: 'Dark',
    bio: 'Pagedone is the one stop ui system for your desired website...',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof GeneralSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleCancel = () => {
    setSettings({
      email: 'ronaldrichards@gmail.com',
      country: 'India',
      language: 'English',
      timezone: 'UTC +05:30 - India Standard Time',
      time_format: '24 hours',
      website: 'Pagedone.com',
      theme: 'Dark',
      bio: 'Pagedone is the one stop ui system for your desired website...',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">General Details</h2>
          <p className="text-sm text-gray-500 mt-1">Comprehensive Overview of Core Configuration and General Settings</p>
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
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-blue-500">✓</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={settings.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone <span className="text-red-500">*</span>
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>UTC +05:30 - India Standard Time</option>
                <option>UTC +00:00 - UTC</option>
                <option>UTC -05:00 - Eastern Time</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={settings.time_format}
                  onChange={(e) => handleChange('time_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>24 hours</option>
                  <option>12 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                    https://
                  </span>
                  <input
                    type="text"
                    value={settings.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Choose your theme</h3>
            <p className="text-sm text-gray-600">
              Change the colors that appear in dashboard <span className="text-red-500">*</span>
            </p>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Dark</option>
              <option>Light</option>
              <option>System</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

