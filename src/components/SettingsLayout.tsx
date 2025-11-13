import { ReactNode } from 'react';
import { Grid, User, Building, Bell, Shield } from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'general', label: 'General Details', icon: Grid },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company Profile', icon: Building },
  { id: 'notification', label: 'Notification', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
];

export default function SettingsLayout({ children, activeSection, onSectionChange }: SettingsLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="bg-white rounded-xl shadow-sm p-4 lg:p-5 flex-shrink-0">
        <div className="mb-4 lg:mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</h3>
          <nav className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 space-y-6">{children}</main>
    </div>
  );
}
