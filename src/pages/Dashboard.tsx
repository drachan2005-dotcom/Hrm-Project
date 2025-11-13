import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Calendar as CalendarIcon,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Attendances from './Attendances';
import CalendarPage from './Calendar';
import Documents from './Documents';
import Employees from './Employees';
import Leaves from './Leaves';
import Payroll from './Payroll';
import SettingsPage from './Settings';
import type { MockUser } from '../lib/mockAuth';
import {
  mockAnnouncements,
  mockAttendances,
  mockEmployees,
  mockSchedules,
} from '../data/mockData';
import type { Employee, ScheduleItem } from '../types';

const DASHBOARD_TABS = [
  'dashboard',
  'employees',
  'attendances',
  'calendar',
  'leaves',
  'payroll',
  'documents',
  'settings',
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number];

interface DashboardProps {
  session: Session | null;
  authLoading: boolean;
  onLogout: () => void;
  onRequireVerification: () => void;
  authMode: 'supabase' | 'mock';
  mockUser: MockUser | null;
}

const isDashboardTab = (value: string): value is DashboardTab =>
  (DASHBOARD_TABS as readonly string[]).includes(value);

export function Dashboard({ session, mockUser, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  const displayName =
    mockUser?.fullName ||
    mockUser?.email ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    'Team';

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'employees':
        return <Employees />;
      case 'attendances':
        return <Attendances />;
      case 'calendar':
        return <CalendarPage />;
      case 'leaves':
        return <Leaves />;
      case 'payroll':
        return <Payroll />;
      case 'documents':
        return <Documents />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  const handleSelectTab = (tab: string) => {
    if (isDashboardTab(tab)) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={handleSelectTab} />
      <div className="ml-64 flex min-h-screen flex-1 flex-col bg-gray-50">
        <Header userName={displayName} activeTab={activeTab} onLogout={onLogout} />
        <main className="flex-1 p-8">{renderActiveTab()}</main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const totalEmployees = mockEmployees.length;
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const newEmployees = mockEmployees.filter((employee) => {
    const joinDate = new Date(employee.join_date);
    return joinDate > monthAgo;
  }).length;

  const activeEmployees = mockEmployees.filter((employee) => employee.status === 'Active').length;
  const onLeaveToday = mockAttendances.filter((attendance) => attendance.status === 'On Leave').length;
  const newJustifications = 200;

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Inactive':
        return 'bg-red-100 text-red-700';
      case 'Onboarding':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScheduleTypeColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'Critical':
        return 'bg-red-100 text-red-700';
      case 'Urgent':
        return 'bg-amber-100 text-amber-700';
      case 'Routine':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const employeeChartData = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 95 },
    { day: 'Thu', value: 88 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 78 },
    { day: 'Sun', value: 82 },
  ];

  const maxValue = Math.max(...employeeChartData.map((dataPoint) => dataPoint.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-amber-100 p-3">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <span className="flex items-center text-sm font-semibold text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              +10%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{totalEmployees.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">Total Employees</p>
            <p className="text-xs text-gray-400">{newEmployees} joined this month</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-3">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm font-semibold text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              +23%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{activeEmployees}</p>
            <p className="mt-1 text-sm text-gray-500">Design Employee</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-pink-100 p-3">
              <CalendarIcon className="h-6 w-6 text-pink-600" />
            </div>
            <span className="flex items-center text-sm font-semibold text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              +18%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{onLeaveToday}</p>
            <p className="mt-1 text-sm text-gray-500">Employee on Leave</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-3">
              <UserX className="h-6 w-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm font-semibold text-red-600">
              <TrendingDown className="mr-1 h-4 w-4" />
              -30%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{newJustifications}</p>
            <p className="mt-1 text-sm text-gray-500">New Justification</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Employee Tracker</h2>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-gray-600">Employee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <span className="text-sm text-gray-600">Intern</span>
                </div>
              </div>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              This week
            </button>
          </div>

          <div className="flex h-64 items-end justify-between space-x-2">
            {employeeChartData.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center">
                <div className="mb-2 flex h-[200px] w-full flex-col items-center justify-end space-y-1">
                  <div
                    className="w-full rounded-t-lg bg-amber-400"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  />
                  <div
                    className="w-full rounded-t-lg bg-blue-400"
                    style={{ height: `${(item.value / maxValue) * 90}%` }}
                  />
                </div>
                <span className="mt-2 text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Schedule</h2>
            <button className="flex items-center space-x-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
              <span>Today</span>
              <CalendarIcon className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-4">
            {mockSchedules.map((schedule) => {
              const employee = mockEmployees.find((item) => item.id === schedule.assigned_to);
              return (
                <div key={schedule.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${getScheduleTypeColor(schedule.type)}`}
                        >
                          {schedule.type}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-800">{schedule.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{schedule.description}</p>
                      {employee && (
                        <div className="mt-2 flex items-center space-x-2">
                          <img
                            src={employee.avatar_url}
                            alt={employee.full_name}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-xs text-gray-600">{employee.full_name}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 transition hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Employees Status</h2>
            <button className="text-gray-400 transition hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Full Name & Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Join Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployees.slice(0, 7).map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee.avatar_url}
                          alt={employee.full_name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{employee.full_name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{employee.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(employee.join_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                          employee.status,
                        )}`}
                      >
                        • {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-gray-400 transition hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Announcement</h2>
            <button className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {mockAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{announcement.description}</p>
                </div>
                <button className="text-gray-400 transition hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
