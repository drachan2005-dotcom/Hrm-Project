import { Search, MoreVertical, Users, Briefcase } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { useState } from 'react';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
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

  const totalEmployees = mockEmployees.length;
  const interns = mockEmployees.filter(e => e.role.toLowerCase().includes('intern')).length;

  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month) => ({
      month,
      employees: Math.floor(Math.random() * 30) + 40,
      interns: Math.floor(Math.random() * 20) + 20
    }));
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => Math.max(d.employees, d.interns)));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Over all Employee Performance</h2>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Employee</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Intern</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="h-64 flex items-end justify-between space-x-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative" style={{ height: '200px' }}>
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(item.employees / maxValue) * 100}%` }}
                  ></div>
                  <div
                    className="w-full bg-amber-400 rounded-t"
                    style={{ height: `${(item.interns / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Employee</p>
              <p className="text-3xl font-bold text-gray-800">{totalEmployees}</p>
              <p className="text-sm text-gray-500 mt-1">Total Employees</p>
            </div>
            <div className="p-4 bg-amber-100 rounded-lg">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Intern</p>
              <p className="text-3xl font-bold text-gray-800">{interns}</p>
              <p className="text-sm text-gray-500 mt-1">Total Interns</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top 3 Employee by Performance</h3>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {mockEmployees.slice(0, 3).map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-500">{index + 1}</span>
                  <img
                    src={employee.avatar_url}
                    alt={employee.full_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-800">{employee.full_name}</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${100 - index * 10}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Employees List</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mobile Number</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Join Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                  <td className="py-3 px-4 text-sm text-gray-700">{employee.role}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{employee.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{employee.mobile_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(employee.join_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      • {employee.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
