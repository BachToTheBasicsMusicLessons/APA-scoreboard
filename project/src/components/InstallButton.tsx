import React from 'react';
import { Download, Check } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface InstallButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InstallButton({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: InstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully');
    }
  };

  // Don't show button if not installable and not installed
  if (!isInstallable && !isInstalled) {
    return null;
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    minimal: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  if (isInstalled) {
    return (
      <button
        disabled
        className={`${baseClasses} ${variantClasses.secondary} ${sizeClasses[size]} opacity-75 cursor-not-allowed ${className}`}
      >
        <Check size={iconSize} className="mr-2" />
        App Installed
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Download size={iconSize} className="mr-2" />
      Install App
    </button>
  );
}