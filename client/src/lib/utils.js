import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n) {
  if (n == null) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function timeAgo(d) {
  if (!d) return '';
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  const intervals = [
    { label: 'y', s: 31536000 },
    { label: 'mo', s: 2592000 },
    { label: 'd', s: 86400 },
    { label: 'h', s: 3600 },
    { label: 'm', s: 60 },
  ];
  for (const { label, s } of intervals) {
    const v = Math.floor(seconds / s);
    if (v >= 1) return `${v}${label} ago`;
  }
  return 'just now';
}

export const STATUS_LABEL = {
  open: 'Open', closed: 'Closed', draft: 'Draft', archived: 'Archived', flagged: 'Flagged',
  pending: 'Pending', shortlisted: 'Shortlisted', accepted: 'Accepted', rejected: 'Rejected',
  invited: 'Invited', declined: 'Declined', withdrawn: 'Withdrawn',
  active: 'Active', completed: 'Completed', cancelled: 'Cancelled',
  todo: 'To do', in_progress: 'In progress', submitted: 'Submitted', approved: 'Approved',
};
