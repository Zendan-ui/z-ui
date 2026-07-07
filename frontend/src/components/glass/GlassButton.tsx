import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function GlassButton({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: GlassButtonProps) {
  const base = 'glass-btn inline-flex items-center justify-center font-medium transition-all active:scale-[0.985]';
  
  const variants = {
    default: '',
    primary: 'glass-btn-primary',
    ghost: 'bg-transparent border-white/10 hover:bg-white/5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
