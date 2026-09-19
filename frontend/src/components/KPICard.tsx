import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  alert?: boolean;
}

export function KPICard({ label, value, icon, color, trend, alert }: KPICardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-navy-card p-4 transition-all hover:shadow-lg ${
        alert ? 'border-emergency/40 shadow-[0_0_12px_rgba(230,57,70,0.1)]' : 'border-navy-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            {label}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-white leading-none">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.direction === 'up' && <TrendingUp size={12} className="text-response" />}
              {trend.direction === 'down' && <TrendingDown size={12} className="text-emergency" />}
              {trend.direction === 'neutral' && <Minus size={12} className="text-muted" />}
              <span
                className={`text-[11px] font-medium ${
                  trend.direction === 'up'
                    ? 'text-response'
                    : trend.direction === 'down'
                      ? 'text-emergency'
                      : 'text-muted'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      {alert && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emergency animate-pulse" />
      )}
    </div>
  );
}
