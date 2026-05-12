import { cn } from '@/lib/utils';

const tones = {
  default: 'bg-panel2 text-fg/80 border-border',
  brand:   'bg-brand-500/15 text-brand-200 border-brand-500/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger:  'bg-danger/15 text-danger border-danger/30',
  muted:   'bg-panel2 text-muted border-border',
  accent:  'bg-accent/15 text-accent border-accent/30',
};

// map domain statuses to tones for consistent coloring
const STATUS_TONE = {
  open: 'brand', closed: 'muted', draft: 'muted', archived: 'muted', flagged: 'danger',
  pending: 'warning', shortlisted: 'brand', accepted: 'success', rejected: 'danger',
  invited: 'accent', declined: 'muted', withdrawn: 'muted',
  active: 'brand', completed: 'success', cancelled: 'danger',
  todo: 'muted', in_progress: 'warning', submitted: 'accent', approved: 'success',
};

export function Badge({ tone = 'default', status, className, children }) {
  const actualTone = status ? STATUS_TONE[status] || 'default' : tone;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        tones[actualTone],
        className
      )}
    >
      {children}
    </span>
  );
}
