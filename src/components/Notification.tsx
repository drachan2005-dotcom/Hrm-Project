import { useState } from 'react';

interface NotificationSettings {
  dailyProductivityUpdate: boolean;
  newEventCreated: boolean;
  whenAddedOnNewTeam: boolean;
  remindersAndEvents: boolean;
  promotionsAndOffers: boolean;
  emailNotifications: boolean;
  smsNotification: boolean;
  mobilePushNotification: boolean;
  desktopNotification: boolean;
}

export default function Notification() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyProductivityUpdate: true,
    newEventCreated: false,
    whenAddedOnNewTeam: false,
    remindersAndEvents: true,
    promotionsAndOffers: false,
    emailNotifications: false,
    smsNotification: true,
    mobilePushNotification: false,
    desktopNotification: true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (field: keyof NotificationSettings) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleCancel = () => {
    setSettings({
      dailyProductivityUpdate: true,
      newEventCreated: false,
      whenAddedOnNewTeam: false,
      remindersAndEvents: true,
      promotionsAndOffers: false,
      emailNotifications: false,
      smsNotification: true,
      mobilePushNotification: false,
      desktopNotification: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notification</h2>
          <p className="text-sm text-gray-500 mt-1">Tailoring Alerts to Your Needs Customizing Settings</p>
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
      <div className="p-6 space-y-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Notify me when</h3>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.dailyProductivityUpdate}
                onChange={() => handleToggle('dailyProductivityUpdate')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Daily productivity update</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.newEventCreated}
                onChange={() => handleToggle('newEventCreated')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">New event created</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.whenAddedOnNewTeam}
                onChange={() => handleToggle('whenAddedOnNewTeam')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">When added on new team</span>
            </label>
          </div>
        </div>

        <NotificationToggle
          title="Reminders and Events"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.remindersAndEvents}
          onToggle={() => handleToggle('remindersAndEvents')}
        />

        <NotificationToggle
          title="Promotions and Offers"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.promotionsAndOffers}
          onToggle={() => handleToggle('promotionsAndOffers')}
        />

        <NotificationToggle
          title="Email Notifications"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.emailNotifications}
          onToggle={() => handleToggle('emailNotifications')}
        />

        <NotificationToggle
          title="SMS Notification"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.smsNotification}
          onToggle={() => handleToggle('smsNotification')}
        />

        <NotificationToggle
          title="Mobile Push Notification"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.mobilePushNotification}
          onToggle={() => handleToggle('mobilePushNotification')}
        />

        <NotificationToggle
          title="Desktop Notification"
          description="Receive push notification whenever you organisation requires your attentions"
          enabled={settings.desktopNotification}
          onToggle={() => handleToggle('desktopNotification')}
        />
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function NotificationToggle({ title, description, enabled, onToggle }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
