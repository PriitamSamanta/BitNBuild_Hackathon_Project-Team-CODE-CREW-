import { Shield } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-emergency to-emergency-critical shrink-0"
      style={{ width: dims, height: dims }}
    >
      <Shield size={dims * 0.55} className="text-white" strokeWidth={2.5} />
    </div>
  );
}
