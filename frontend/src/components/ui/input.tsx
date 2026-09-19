import * as React from 'react';
import { cn } from '@/src/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('flex h-9 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-sm text-white placeholder:text-muted focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal', className)} {...props} />
));
Input.displayName = 'Input';
