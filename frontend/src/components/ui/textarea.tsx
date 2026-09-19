import * as React from 'react';
import { cn } from '@/src/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('flex min-h-20 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-sm text-white placeholder:text-muted focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal', className)} {...props} />
));
Textarea.displayName = 'Textarea';
