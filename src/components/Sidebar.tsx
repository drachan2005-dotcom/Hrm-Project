import { LayoutDashboard, Users, ClipboardList, Calendar, FileText, DollarSign, File, Settings, HelpCircle, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendances', label: 'Attendances', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leaves', label: 'Leaves', icon: FileText },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: File }
  ];

  const userItems = [
    { id: 'settings', label: 'Settings', icon: Settings, tab: 'settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Pagedone</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MENU</p>
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="py-4 border-t border-gray-200">
          <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">USER</p>
          <nav className="space-y-1 px-3">
            {userItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.tab ? activeTab === item.tab : false;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.tab) {
                      setActiveTab(item.tab);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-2 py-3">
          <img
            src="https://i.pravatar.cc/150?img=8"
            alt="Ronald Richards"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Ronald Richards</p>
            <p className="text-xs text-gray-500">@ronaldrich</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </div>
      </div>
    </aside>
  );
}
