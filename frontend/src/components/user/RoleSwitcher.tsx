'use client';

import { Shield, User, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface RoleSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function RoleSwitcher({ compact = false, className = '' }: RoleSwitcherProps) {
  const { userRole, setUserRole } = useApp();

  const handleToggle = () => {
    setUserRole(userRole === 'admin' ? 'user' : 'admin');
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        title={userRole === 'admin' ? 'Switch to Citizen Portal' : 'Switch to Admin Command Center'}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
          userRole === 'admin'
            ? 'border-royal/40 bg-royal/10 text-royal hover:bg-royal/20'
            : 'border-emergency/40 bg-emergency/10 text-emergency hover:bg-emergency/20'
        } ${className}`}
      >
        <ArrowRightLeft size={12} />
        <span>{userRole === 'admin' ? 'Admin' : 'Citizen'}</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl border border-navy-border bg-navy-card/80 p-1 ${className}`}>
      <button
        onClick={() => setUserRole('user')}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          userRole === 'user'
            ? 'bg-emergency text-white shadow-md shadow-emergency/20'
            : 'text-secondary hover:text-white'
        }`}
      >
        <User size={13} />
        <span>Citizen Mode</span>
      </button>

      <button
        onClick={() => setUserRole('admin')}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          userRole === 'admin'
            ? 'bg-royal text-white shadow-md shadow-royal/20'
            : 'text-secondary hover:text-white'
        }`}
      >
        <Shield size={13} />
        <span>Admin Command</span>
      </button>
    </div>
  );
}
