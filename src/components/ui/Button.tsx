import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f0f]';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-green-500 hover:bg-green-400 text-black font-semibold shadow-sm focus:ring-green-500 active:scale-[0.98]',
    secondary:
      'bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 border border-[#333] focus:ring-gray-600 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#242424] text-gray-300 border border-[#3a3a3a] focus:ring-gray-600',
    danger:
      'bg-red-600 hover:bg-red-500 text-white focus:ring-red-600 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#242424] text-gray-400 hover:text-gray-200 focus:ring-gray-600',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
