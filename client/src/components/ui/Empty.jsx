import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export function Empty({ title, description, icon: Icon = Inbox, action, className }) {
  return (
    <div className={cn('glass flex flex-col items-center justify-center rounded-2xl p-12 text-center', className)}>
      <div className="mb-3 rounded-full bg-panel2 p-3 text-brand-300">
        <Icon size={28} />
      </div>
      <h4 className="text-base font-semibold">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
