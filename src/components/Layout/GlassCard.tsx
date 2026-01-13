import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'accent';
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'light', onClick }) => {
  // Changed rounded-2xl to rounded-lg for squared look
  const baseClasses = "rounded-lg transition-all duration-300";
  
  let variantClasses = "";
  if (variant === 'light') {
    variantClasses = "glass-panel hover:shadow-lg hover:bg-white/80";
  } else if (variant === 'dark') {
    variantClasses = "glass-panel-dark text-white";
  } else if (variant === 'accent') {
    variantClasses = "bg-gradient-to-br from-shinhan-blue to-shinhan-dark text-white shadow-xl shadow-blue-500/20";
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${className} ${onClick ? 'cursor-pointer active:scale-98' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;