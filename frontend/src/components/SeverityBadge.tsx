import type { Severity } from '@/src/types';
import { SEVERITY_META } from '@/src/types';

export function SeverityBadge({
  severity,
  size = 'sm',
}: {
  severity: Severity;
  size?: 'xs' | 'sm' | 'md';
}) {
  const meta = SEVERITY_META[severity];
  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];
  return (
    <span
      className={`inline-flex items-center rounded font-bold uppercase tracking-wide ${sizes}`}
      style={{ color: meta.color, backgroundColor: meta.bgColor, border: `1px solid ${meta.borderColor}` }}
    >
      {meta.label}
    </span>
  );
}
