import { Search, MoreVertical, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { mockPayroll, mockEmployees } from '../data/mockData';
import { useState } from 'react';

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayroll = mockPayroll.filter(payroll => {
    const employee = mockEmployees.find(e => e.id === payroll.employee_id);
    if (!employee) return false;

    return employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payroll.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalAmount = 9823.0;
  const totalPaid = mockPayroll.filter(p => p.status === 'Completed').length;
  const totalPending = mockPayroll.filter(p => p.status === 'Pending').length;
  const successfullyPaid = 62;
  const pendingPayments = 15;
  const unpaidPayments = 23;

  const generateRevenueData = () => {
    const days = Array.from({ length: 5 }, (_, i) => i + 21);
    return days.map(day => ({
      day,
      revenue: Math.random() * 50 + 30,
      expenses: Math.random() * 40 + 20
    }));
  };

  const revenueData = generateRevenueData();

  const generateExpenseData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      employee: Math.random() * 70 + 20,
      freelancer: Math.random() * 60 + 10
    }));
  };

  const expenseData = generateExpenseData();
  const maxExpense = Math.max(...expenseData.map(d => Math.max(d.employee, d.freelancer)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Payment Status</h3>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#3b82f6"
                strokeWidth="16"
                fill="none"
                strokeDasharray="352"
                strokeDashoffset="88"
                strokeLinecap="round"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#f97316"
                strokeWidth="16"
                fill="none"
                strokeDasharray="352"
                strokeDashoffset="220"
                strokeLinecap="round"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#fbbf24"
                strokeWidth="16"
                fill="none"
                strokeDasharray="352"
                strokeDashoffset="272"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">1035+</p>
                <p className="text-xs text-gray-500">Total Amount</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">{successfullyPaid}% Successfully Paid</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">{pendingPayments}% Pending</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-gray-600">{unpaidPayments}% Unpaid</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">+12% from last month</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Optimize again to get best score</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Company Cash Flow</h3>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Comparison</span>
            </div>
            <div className="flex space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-32 mb-4">
            <div className="flex items-end justify-between h-full space-x-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end space-y-1">
                  <div className="w-full bg-green-500 rounded-t" style={{ height: `${item.revenue}%` }}></div>
                  <div className="w-full bg-red-500 rounded-t" style={{ height: `${item.expenses}%` }}></div>
                  <span className="text-xs text-gray-500 text-center">Jan {item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-xl font-bold text-gray-800">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-green-600">
              <span>Freelancer</span>
              <span className="font-semibold">Employee Amount</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Employee Salary Tracker</h3>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-gray-500">0.8K</span>
              <span className="text-xs text-gray-500">0.6K</span>
            </div>
          </div>

          <div className="h-40 flex items-end justify-between space-x-2">
            {expenseData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full relative" style={{ height: '120px' }}>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-0.5">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(item.employee / maxExpense) * 100}%` }}
                    ></div>
                    <div
                      className="w-full bg-red-500 rounded-t"
                      style={{ height: `${(item.freelancer / maxExpense) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Employee</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Freelancer</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Amount</h3>
            <p className="text-4xl font-bold text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-green-700">{totalPaid}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-semibold text-red-700">{totalPending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Employees Payroll</h2>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">End Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Salary</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((payroll) => {
                const employee = mockEmployees.find(e => e.id === payroll.employee_id);
                if (!employee) return null;

                return (
                  <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <td className="py-3 px-4 text-sm text-gray-700">{payroll.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payroll.period}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(payroll.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">${payroll.salary.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                        • {payroll.status}
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
