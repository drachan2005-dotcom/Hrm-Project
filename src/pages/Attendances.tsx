import { Search, MoreVertical, Users, TrendingUp, Calendar, Filter } from 'lucide-react';
import { mockEmployees, mockAttendances } from '../data/mockData';
import { useState } from 'react';

export default function Attendances() {
  const [filterTab, setFilterTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const todayAttendances = mockAttendances.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today || a.date === '2024-01-15';
  });

  const presentCount = 980;
  const attendancePercentage = 91.5;
  const yesterdayPercentage = 90.0;

  const employeePerformanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    today: Math.random() * 100,
    yesterday: Math.random() * 100
  }));

  const filteredAttendances = todayAttendances.filter(attendance => {
    const employee = mockEmployees.find(e => e.id === attendance.employee_id);
    if (!employee) return false;

    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTab === 'All') return matchesSearch;
    if (filterTab === 'Present') return matchesSearch && attendance.status === 'Present';
    if (filterTab === 'On Leave') return matchesSearch && attendance.status === 'On Leave';

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700';
      case 'Absent':
        return 'bg-red-100 text-red-700';
      case 'On Leave':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };


  const circleCircumference = 2 * Math.PI * 90;
  const percentageFilled = (attendancePercentage / 100) * circleCircumference;
  const presentToday = todayAttendances.filter((item) => item.status === 'Present').length;
  const leaveToday = todayAttendances.filter((item) => item.status === 'On Leave').length;
  const absentToday = todayAttendances.filter((item) => item.status === 'Absent').length;
  const totalTrackerRecords = todayAttendances.length || 1;
  const trackerPercentage = Math.round((presentToday / totalTrackerRecords) * 100);
  const trackerRadius = 90;
  const trackerArcLength = Math.PI * trackerRadius;
  const trackerStrokeOffset = trackerArcLength * (1 - trackerPercentage / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Today's Attendances</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-800">{presentCount}</p>
              <p className="text-sm text-gray-500 mt-1">Presents in Building</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Today's Performance</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-800">{attendancePercentage}%</p>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-semibold">+3.0%</span>
              </div>
              <p className="text-xs text-gray-500">Yesterday {yesterdayPercentage}%</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleCircumference - percentageFilled}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">{attendancePercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Tracker</h3>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-1">
              <span>Today</span>
              <Calendar className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div
              className="relative w-full mx-auto max-w-xs sm:max-w-sm"
              style={{ aspectRatio: '2 / 1' }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 220 120"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={trackerArcLength}
                  strokeDashoffset={trackerStrokeOffset}
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                <p className="text-4xl font-bold text-gray-900">{trackerPercentage}%</p>
                <p className="text-sm text-gray-500">Present employees</p>
              </div>
            </div>

            <div className="grid w-full gap-4 text-center sm:grid-cols-3">
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Present</p>
                <p className="text-lg font-semibold text-gray-900">{presentToday}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">On Leave</p>
                <p className="text-lg font-semibold text-gray-900">{leaveToday}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Absent</p>
                <p className="text-lg font-semibold text-gray-900">{absentToday}</p>
              </div>
            </div>

            <div className="w-full rounded-lg bg-blue-50 px-4 py-3 text-center">
              <p className="text-xs text-blue-600">Department with highest presence</p>
              <p className="text-base font-semibold text-blue-700">Product Design</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Employee Performance</h2>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Yesterday</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="h-48 relative">
          <svg className="w-full h-full" viewBox="0 0 1000 200">
            <polyline
              points={employeePerformanceData
                .map((d, i) => `${(i / 23) * 1000},${200 - d.today * 1.5}`)
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <polyline
              points={employeePerformanceData
                .map((d, i) => `${(i / 23) * 1000},${200 - d.yesterday * 1.5}`)
                .join(' ')}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
            <span>9 AM</span>
            <span>10 AM</span>
            <span>11 AM</span>
            <span>12 PM</span>
            <span>1 PM</span>
            <span>2 PM</span>
            <span>3 PM</span>
            <span>4 PM</span>
            <span>5 PM</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Employees Attendances</h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {['All', 'Present', 'On Leave'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Full Name & Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Join Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.map((attendance) => {
                const employee = mockEmployees.find(e => e.id === attendance.employee_id);
                if (!employee) return null;

                return (
                  <tr key={attendance.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee.avatar_url}
                          alt={employee.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{employee.full_name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{employee.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(employee.join_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        • {attendance.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

