import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-brand-500 hover:bg-brand-400 text-white shadow-glow disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-panel2 hover:bg-panel border border-border text-fg disabled:opacity-50',
  ghost:
    'hover:bg-panel2 text-fg disabled:opacity-50',
  outline:
    'border border-border hover:bg-panel2 text-fg disabled:opacity-50',
  danger:
    'bg-danger/90 hover:bg-danger text-white',
  success:
    'bg-success/90 hover:bg-success text-white',
};

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  loading,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
