// Component hiển thị logo của app
import { MessageSquare } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon logo */}
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>
      {/* Tên app */}
      <span className="text-xl font-bold text-gray-900">Pagedone</span>
    </div>
  );
}
