import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-navy-border bg-navy-card shadow-2xl animate-slide-up`}
      >
        <div className="flex items-start gap-3 border-b border-navy-border px-5 py-4">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-secondary text-emergency shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-navy-secondary hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
