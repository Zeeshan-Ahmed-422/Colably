import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { className, label, error, ...props },
  ref
) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-fg/80">{label}</span>}
      <input
        ref={ref}
        {...props}
        className={cn(
          'h-10 w-full rounded-xl border border-border bg-panel2/60 px-3 text-sm text-fg',
          'placeholder:text-muted/70 outline-none transition',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, label, error, ...props },
  ref
) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-fg/80">{label}</span>}
      <textarea
        ref={ref}
        {...props}
        className={cn(
          'min-h-[96px] w-full rounded-xl border border-border bg-panel2/60 p-3 text-sm text-fg',
          'placeholder:text-muted/70 outline-none transition',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
          error && 'border-danger',
          className
        )}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
});

export const Select = forwardRef(function Select(
  { className, label, children, ...props },
  ref
) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-fg/80">{label}</span>}
      <select
        ref={ref}
        {...props}
        className={cn(
          'h-10 w-full rounded-xl border border-border bg-panel2/60 px-3 text-sm text-fg',
          'outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
          className
        )}
      >
        {children}
      </select>
    </label>
  );
});
