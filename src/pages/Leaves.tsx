import { Search, MoreVertical, X } from 'lucide-react';
import { mockLeaves, mockEmployees } from '../data/mockData';
import { useState } from 'react';

export default function Leaves() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredLeaves = mockLeaves.filter(leave => {
    const employee = mockEmployees.find(e => e.id === leave.employee_id);
    if (!employee) return false;

    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || leave.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approve':
        return 'bg-blue-600 text-white';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Paid Leave':
        return 'bg-green-100 text-green-700';
      case 'Sick Leave':
        return 'bg-blue-100 text-blue-700';
      case 'Casual Leave':
        return 'bg-purple-100 text-purple-700';
      case 'Medical Leave':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      employees: Math.floor(Math.random() * 60) + 40,
      interns: Math.floor(Math.random() * 40) + 20
    }));
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => Math.max(d.employees, d.interns)));

  const paidLeaves = mockLeaves.filter(l => l.leave_type === 'Paid Leave').length;
  const sickLeaves = mockLeaves.filter(l => l.leave_type === 'Sick Leave').length;
  const casualLeaves = mockLeaves.filter(l => l.leave_type === 'Casual Leave').length;
  const trackedLeavesTotal = paidLeaves + sickLeaves + casualLeaves;
  const formattedTrackedLeaves = trackedLeavesTotal.toLocaleString('en-US');
  const leaveChartRadius = 70;
  const leaveChartCircumference = 2 * Math.PI * leaveChartRadius;
  const leaveProgressRatio = Math.min(trackedLeavesTotal / Math.max(mockLeaves.length, 1), 1);
  const leaveStrokeOffset = leaveChartCircumference * (1 - leaveProgressRatio);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Employee Leave Each Months</h2>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Employee</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Intern</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="h-64 flex items-end justify-between space-x-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative" style={{ height: '200px' }}>
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end">
                  <div
                    className="w-2/5 bg-blue-500 rounded-t mx-0.5"
                    style={{ height: `${(item.employees / maxValue) * 100}%` }}
                  ></div>
                  <div
                    className="w-2/5 bg-purple-400 rounded-t mx-0.5"
                    style={{ height: `${(item.interns / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Employee Leave Tracker</h2>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="relative h-48 w-48">
              <svg className="h-full w-full" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="leaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="33%" stopColor="#3b82f6" />
                    <stop offset="66%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r={leaveChartRadius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="14"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={leaveChartRadius}
                  fill="none"
                  stroke="url(#leaveGradient)"
                  strokeWidth="14"
                  strokeDasharray={leaveChartCircumference}
                  strokeDashoffset={leaveStrokeOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold text-gray-800">{formattedTrackedLeaves}</p>
                <p className="text-sm text-gray-500">Total leave</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Paid Leave</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{paidLeaves}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Sick Leave</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{sickLeaves}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Casual Leave</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{casualLeaves}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Employee on leaves</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">See all</button>
          </div>

          <div className="space-y-4">
            {mockLeaves.slice(0, 5).map((leave) => {
              const employee = mockEmployees.find(e => e.id === leave.employee_id);
              if (!employee) return null;

              return (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={employee.avatar_url}
                      alt={employee.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{employee.full_name}</p>
                      <p className="text-xs text-gray-500">{leave.leave_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {leave.days_left && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {leave.days_left} Days left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Employees Attendances</h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {['All', 'Approve', 'Pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Leave Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">End Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => {
                const employee = mockEmployees.find(e => e.id === leave.employee_id);
                if (!employee) return null;

                return (
                  <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leave_type)}`}>
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(leave.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(leave.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </button>
                        {leave.status === 'Approve' && (
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
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

