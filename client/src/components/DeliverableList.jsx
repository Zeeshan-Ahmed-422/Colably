import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, Send, ThumbsUp, ThumbsDown, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input, Textarea } from '@/components/ui/Input.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { STATUS_LABEL, formatDate } from '@/lib/utils';

const STATUS_ICON = {
  todo: Clock,
  in_progress: Clock,
  submitted: Send,
  approved: CheckCircle2,
  rejected: ThumbsDown,
};

export default function DeliverableList({ collaboration, deliverables, isBrand, isInfluencer, onChange }) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [submission, setSubmission] = useState({ proofUrl: '', submissionNote: '' });
  const [feedback, setFeedback] = useState('');
  const [adding, setAdding] = useState({ title: '', description: '', dueDate: '' });

  const completionPct = deliverables.length
    ? Math.round((deliverables.filter((d) => d.status === 'approved').length / deliverables.length) * 100)
    : 0;

  const openSubmission = (d) => {
    setActive(d);
    setSubmission({ proofUrl: d.proofUrl || '', submissionNote: d.submissionNote || '' });
    setFeedback(d.feedback || '');
    setOpen(true);
  };

  const submitDeliverable = async () => {
    try {
      await api.patch(`/deliverables/${active._id}`, {
        proofUrl: submission.proofUrl,
        submissionNote: submission.submissionNote,
        status: 'submitted',
      });
      toast.success('Submitted for review');
      setOpen(false);
      onChange?.();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not submit');
    }
  };

  const review = async (status) => {
    try {
      await api.patch(`/deliverables/${active._id}`, { status, feedback });
      toast.success(`Marked ${status}`);
      setOpen(false);
      onChange?.();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not update');
    }
  };

  const addDeliverable = async () => {
    if (!adding.title.trim()) return toast.error('Title required');
    try {
      await api.post('/deliverables', {
        collaborationId: collaboration._id,
        title: adding.title,
        description: adding.description,
        dueDate: adding.dueDate || undefined,
      });
      toast.success('Deliverable added');
      setAdding({ title: '', description: '', dueDate: '' });
      setAddOpen(false);
      onChange?.();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not add');
    }
  };

  const remove = async (d) => {
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      await api.delete(`/deliverables/${d._id}`);
      toast.success('Deleted');
      onChange?.();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not delete');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Deliverables</CardTitle>
          <p className="text-xs text-muted">{completionPct}% approved</p>
        </div>
        {isBrand && (
          <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add
          </Button>
        )}
      </CardHeader>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-panel2">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent transition-all"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {deliverables.length === 0 ? (
        <Empty title="No deliverables yet" description={isBrand ? 'Add the first one above.' : 'The brand has not added deliverables yet.'} />
      ) : (
        <ul className="space-y-2">
          {deliverables.map((d) => {
            const Icon = STATUS_ICON[d.status] || Clock;
            return (
              <li key={d._id} className="rounded-xl border border-border bg-panel2/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => openSubmission(d)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-panel text-brand-300">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.title}</div>
                      <div className="text-xs text-muted">
                        {d.dueDate ? `Due ${formatDate(d.dueDate)}` : 'No due date'}
                        {d.proofUrl ? ' · Proof attached' : ''}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge status={d.status}>{STATUS_LABEL[d.status]}</Badge>
                    {isBrand && (
                      <button onClick={() => remove(d)} className="rounded-lg p-1 text-muted hover:bg-panel hover:text-danger" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={active?.title || 'Deliverable'}
        size="lg"
        footer={
          isBrand && active?.status === 'submitted' ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
              <Button variant="danger" onClick={() => review('rejected')}><ThumbsDown size={14} /> Reject</Button>
              <Button variant="success" onClick={() => review('approved')}><ThumbsUp size={14} /> Approve</Button>
            </>
          ) : isInfluencer && ['todo', 'in_progress', 'rejected'].includes(active?.status) ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={submitDeliverable}><Send size={14} /> Submit for review</Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          )
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge status={active.status}>{STATUS_LABEL[active.status]}</Badge>
              {active.dueDate && <span className="text-muted">Due {formatDate(active.dueDate)}</span>}
            </div>
            {active.description && <p className="text-sm text-muted">{active.description}</p>}

            {(isInfluencer || active.proofUrl || active.submissionNote) && (
              <div className="space-y-3 rounded-xl border border-border bg-panel2/40 p-3">
                <div className="text-xs uppercase tracking-wide text-muted">Submission</div>
                {isInfluencer && ['todo', 'in_progress', 'rejected'].includes(active.status) ? (
                  <>
                    <Input label="Proof URL" placeholder="Link to your post / draft / drive"
                      value={submission.proofUrl}
                      onChange={(e) => setSubmission({ ...submission, proofUrl: e.target.value })} />
                    <Textarea label="Note" placeholder="Anything the brand should know"
                      value={submission.submissionNote}
                      onChange={(e) => setSubmission({ ...submission, submissionNote: e.target.value })} />
                  </>
                ) : (
                  <>
                    {active.proofUrl ? (
                      <a className="text-sm text-brand-300 hover:underline" href={active.proofUrl} target="_blank" rel="noreferrer">
                        {active.proofUrl}
                      </a>
                    ) : <p className="text-sm text-muted">No proof attached.</p>}
                    {active.submissionNote && <p className="text-sm">{active.submissionNote}</p>}
                  </>
                )}
              </div>
            )}

            {(isBrand && active.status === 'submitted') || active.feedback ? (
              <div className="space-y-2 rounded-xl border border-border bg-panel2/40 p-3">
                <div className="text-xs uppercase tracking-wide text-muted">Brand feedback</div>
                {isBrand && active.status === 'submitted' ? (
                  <Textarea placeholder="Feedback (optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                ) : (
                  active.feedback ? <p className="text-sm">{active.feedback}</p> : <p className="text-sm text-muted">—</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add deliverable"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addDeliverable}>Add</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Title" placeholder="e.g. 1 Instagram Reel"
            value={adding.title} onChange={(e) => setAdding({ ...adding, title: e.target.value })} />
          <Textarea label="Description (optional)"
            value={adding.description} onChange={(e) => setAdding({ ...adding, description: e.target.value })} />
          <Input type="date" label="Due date"
            value={adding.dueDate} onChange={(e) => setAdding({ ...adding, dueDate: e.target.value })} />
        </div>
      </Modal>
    </Card>
  );
}
