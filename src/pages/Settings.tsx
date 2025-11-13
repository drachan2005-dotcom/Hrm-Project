import { useState } from 'react';
import SettingsLayout from '../components/SettingsLayout';
import GeneralDetails from '../components/GeneralDetails';
import Profile from '../components/Profile';
import Notification from '../components/Notification';
import SecurityPrivacy from '../components/SecurityPrivacy';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralDetails />;
      case 'profile':
        return <Profile />;
      case 'notification':
        return <Notification />;
      case 'security':
        return <SecurityPrivacy />;
      case 'company':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
            <p className="text-gray-500 mt-2">Company profile settings coming soon...</p>
          </div>
        );
      default:
        return <GeneralDetails />;
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span>User</span>
          <span>/</span>
          <span className="text-blue-600 font-medium">Settings</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back, <span className="text-blue-600">Ronald!</span>
          </h1>
          <p className="text-base text-gray-500">
            Keep your personal information, preferences, and security details up to date.
          </p>
        </div>
      </header>
      <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {renderContent()}
      </SettingsLayout>
    </section>
  );
}
