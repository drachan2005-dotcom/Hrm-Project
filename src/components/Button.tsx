// Component button tái sử dụng
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  fullWidth = true,
  disabled = false
}: ButtonProps) {

  // Class CSS dựa trên variant
  const baseClass = 'py-3 px-6 rounded-lg font-medium transition duration-200';
  const variantClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${widthClass} ${disabledClass}`}
    >
      {children}
    </button>
  );
}
