// Component input tái sử dụng cho các form
import { Lock, Mail, Phone, User } from 'lucide-react';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  icon?: 'email' | 'password' | 'user' | 'phone';
}

export function Input({
  type,
  placeholder,
  value,
  onChange,
  label,
  required = false,
  icon
}: InputProps) {

  // Hàm chọn icon phù hợp
  const renderIcon = () => {
    switch (icon) {
      case 'email':
        return <Mail className="w-5 h-5 text-gray-400" />;
      case 'password':
        return <Lock className="w-5 h-5 text-gray-400" />;
      case 'user':
        return <User className="w-5 h-5 text-gray-400" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Label nếu có */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input field với icon */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {renderIcon()}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
          required={required}
        />
      </div>
    </div>
  );
}
