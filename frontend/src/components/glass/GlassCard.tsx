import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  className = '', 
  hoverable = true,
  onClick 
}: GlassCardProps) {
  return (
    <div 
      className={`glass-card p-6 ${hoverable ? 'glass-hover-lift' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
