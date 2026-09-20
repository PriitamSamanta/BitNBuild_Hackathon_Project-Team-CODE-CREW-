'use client';

import { CitizenPortal } from '@/components/citizen/citizen-portal';
import type { UserPageId } from '@/components/user/UserHeader';

interface UserDashboardProps {
  onNavigate?: (page: UserPageId) => void;
  onOpenSOS?: () => void;
}

export function UserDashboard({ onNavigate, onOpenSOS }: UserDashboardProps) {
  void onNavigate;
  void onOpenSOS;

  return <CitizenPortal />;
}
