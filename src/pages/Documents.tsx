import { FolderOpen, File, MoreVertical, Check } from 'lucide-react';
import { mockDocuments, mockEmployees } from '../data/mockData';

export default function Documents() {
  const uploadProgress = 100;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    if (percentage >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const teams = [
    { name: 'Product Design Team', size: 7.5, unit: 'MB', date: 'Sat, 25 Feb' },
    { name: 'Developer Team', size: 430, unit: 'MB', date: 'Sat, 25 Feb' },
    { name: 'Finance Team', size: 2.5, unit: 'GB', date: 'Sat, 25 Feb' },
    { name: 'Finance Team', size: 2.5, unit: 'GB', date: 'Sat, 25 Feb' }
  ];

  const storageCategories = [
    { label: 'All Storage', value: '100%' },
    { label: 'Full Storage', value: '60%' },
    { label: 'Empty Storage', value: '40%' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          {teams.map((team, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  index === 0 ? 'bg-amber-100' :
                  index === 1 ? 'bg-green-100' :
                  index === 2 ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <FolderOpen className={`w-6 h-6 ${
                    index === 0 ? 'text-amber-600' :
                    index === 1 ? 'text-green-600' :
                    index === 2 ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{team.name}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-800">{team.size} {team.unit}</span>
                <span className="text-sm text-gray-500">{team.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Upload Documents</h3>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <File className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">Drag an image here</p>
            <p className="text-xs text-gray-500 mb-4">or</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Choose File
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <File className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">General Documents.txt</span>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Upload template</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-blue-600">{uploadProgress}%</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">G</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Google Drive</p>
                <p className="text-sm text-gray-500">Use Google Drive to storage your account data and document</p>
              </div>
              <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50">
                Connected
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">My Drive</p>
              <p className="text-xs text-gray-500 mb-4">
                Use Google Drive to storage your account data and document
              </p>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Click here to lear more
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Employees Attendances</h2>
            <div className="flex space-x-2">
              {storageCategories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    index === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Modified</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Storage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDocuments.map((doc) => {
                  const employee = mockEmployees.find(e => e.id === doc.employee_id);
                  if (!employee) return null;

                  return (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(doc.last_modified).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-800">
                                {formatFileSize(doc.file_size)}
                              </span>
                              <span className="text-xs text-gray-500">{doc.storage_percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getStorageColor(doc.storage_percentage)}`}
                                style={{ width: `${doc.storage_percentage}%` }}
                              ></div>
                            </div>
                          </div>
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

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Storage Overview</h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Used Storage</span>
                <span className="text-sm font-semibold text-gray-800">68%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Documents</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">2.5 GB</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Images</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">1.8 GB</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Videos</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">3.2 GB</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Others</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">500 MB</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Storage</span>
                <span className="text-lg font-bold text-gray-800">10 GB</span>
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Upgrade Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
