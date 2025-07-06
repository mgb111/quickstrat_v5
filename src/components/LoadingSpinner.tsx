import React from 'react';
import { Loader2, Zap, FileText, Users, Mail } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'bounce';
  icon?: 'default' | 'zap' | 'file' | 'users' | 'mail';
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  type = 'spinner',
  icon = 'default',
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const iconMap = {
    default: Loader2,
    zap: Zap,
    file: FileText,
    users: Users,
    mail: Mail
  };

  const IconComponent = iconMap[icon];

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${variantClasses[variant]}`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${variantClasses[variant]}`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${variantClasses[variant]}`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-current rounded-full animate-pulse ${variantClasses[variant]}`}></div>
        );
      
      case 'bounce':
        return (
          <div className={`${sizeClasses[size]} bg-current rounded-full animate-bounce ${variantClasses[variant]}`}></div>
        );
      
      case 'spinner':
      default:
        return (
          <IconComponent className={`${sizeClasses[size]} animate-spin ${variantClasses[variant]}`} />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`mt-3 text-sm font-medium ${variantClasses[variant]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Predefined loading components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

export const ContentLoader: React.FC<{ text?: string }> = ({ text = 'Loading content...' }) => (
  <div className="py-12 flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const ButtonLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <LoadingSpinner size="sm" text={text} />
);

export const CardLoader: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex space-x-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner; 