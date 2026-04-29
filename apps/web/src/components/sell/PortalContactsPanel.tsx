/**
 * PortalContactsPanel — customer-detail sub-panel for managing who can log
 * into the portal for this customer.
 *
 * Renders in the "Contacts" tab of SellCustomerDetail. Internal admin/lead
 * users can:
 *   - see all contacts (active, invited, revoked) with last-login + role
 *   - invite a new contact (email, role, optional title/phone)
 *   - resend an invitation
 *   - revoke access (soft — flips status to 'revoked', does not delete)
 *
 * Writes flow through `portalAccessService` which owns the mock store. When
 * Supabase lands, swap the service for the real one — this component is
 * otherwise unchanged.
 *
 * Permissions: `portal.invitations.send` / `portal.invitations.revoke`
 * from AuthContext. Customers with only `portal.access` see a read-only
 * variant (hidden here because internal is the only caller today).
 */

import { useMemo, useState } from 'react';
import {
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Ban,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { portalAccessService } from '@/services';
import type {
  CustomerContact,
  CustomerContactRole,
} from '@/types/entities';
import { useAuth } from '@/contexts/AuthContext';

// ── Helpers ───────────────────────────────────────────────────

function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadge(status: CustomerContact['status']): {
  label: string;
  className: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className:
          'bg-[var(--mw-success)]/10 text-[var(--mw-success)] border-[var(--mw-success)]/20',
        icon: <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />,
      };
    case 'invited':
      return {
        label: 'Invited',
        className:
          'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-700)] border-[var(--mw-yellow-200)]',
        icon: <Clock3 className="h-3 w-3" strokeWidth={1.75} />,
      };
    case 'revoked':
      return {
        label: 'Revoked',
        className:
          'bg-[var(--neutral-200)] text-[var(--neutral-600)] border-[var(--border)]',
        icon: <XCircle className="h-3 w-3" strokeWidth={1.75} />,
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        className:
          'bg-[var(--neutral-100)] text-[var(--neutral-500)] border-[var(--border)]',
        icon: <Loader2 className="h-3 w-3" strokeWidth={1.75} />,
      };
  }
}

// ── Main ──────────────────────────────────────────────────────

export interface PortalContactsPanelProps {
  customerId: string;
  customerCompany: string;
}

export function PortalContactsPanel({
  customerId,
  customerCompany,
}: PortalContactsPanelProps) {
  const { identity, hasPermission } = useAuth();
  // Local tick to force re-read from the mock service after mutations.
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] =
    useState<CustomerContact | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const contacts = useMemo(
    () => portalAccessService.listContacts(customerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId],
  );
  const pendingInvites = useMemo(
    () => portalAccessService.listPendingInvitations(customerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId],
  );

  const canSend = hasPermission('portal.invitations.send');
  const canRevoke = hasPermission('portal.invitations.revoke');

  const handleResend = (contact: CustomerContact) => {
    const actorId =
      identity.kind === 'internal' ? identity.user.id : identity.contact.id;
    const inv = portalAccessService.resendInvitation({
      customerId,
      contactId: contact.id,
    });
    void actorId;
    toast.success('Invitation re-sent', {
      description: `A new invite link was emailed to ${contact.email}. Expires ${new Date(inv.expiresAt).toLocaleDateString('en-AU')}.`,
    });
    refresh();
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    const actorId =
      identity.kind === 'internal' ? identity.user.id : identity.contact.id;
    portalAccessService.revoke({
      customerId,
      contactId: revokeTarget.id,
      revokedByEmployeeId: actorId,
      reason: revokeReason || undefined,
    });
    toast.success('Portal access revoked', {
      description: `${revokeTarget.name} can no longer sign in.`,
    });
    setRevokeTarget(null);
    setRevokeReason('');
    refresh();
  };

  return (
    <div className="space-y-5">
      <Card className="border border-[var(--border)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-mirage)] text-white">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Portal access
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                Who from {customerCompany} can sign in to the customer portal.
              </p>
            </div>
          </div>
          {canSend && (
            <Button
              onClick={() => setInviteOpen(true)}
              className="h-9 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite portal user
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          {contacts.map((c) => {
            const status = statusBadge(c.status);
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-card px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neutral-200)] text-xs font-semibold text-[var(--mw-mirage)]">
                  {c.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    {c.isPrimaryBilling && (
                      <Badge
                        variant="outline"
                        className="h-5 border-[var(--mw-mirage)]/20 bg-[var(--mw-mirage)]/5 px-1.5 text-[10px] font-medium text-[var(--mw-mirage)]"
                      >
                        Primary billing
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="h-5 border-[var(--border)] bg-[var(--neutral-100)] px-1.5 text-[10px] uppercase tracking-wide text-[var(--neutral-600)]"
                    >
                      {c.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`h-5 gap-1 px-1.5 text-[10px] font-medium ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--neutral-500)]">
                    {c.title ? `${c.title} · ` : ''}
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" strokeWidth={1.75} />
                      {c.email}
                    </span>
                    {c.phone && (
                      <>
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" strokeWidth={1.75} />
                          {c.phone}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--neutral-500)]">
                    {c.status === 'active' &&
                      `Last login ${relativeTime(c.lastLoginAt)}`}
                    {c.status === 'invited' &&
                      `Invited ${relativeTime(c.invitedAt)}`}
                    {c.status === 'revoked' &&
                      `Revoked ${relativeTime(c.revokedAt)}`}
                    {c.status === 'pending' && 'No invite sent yet'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(c.status === 'invited' || c.status === 'pending') && canSend && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-[var(--border)]"
                      onClick={() => handleResend(c)}
                    >
                      <RefreshCw className="mr-1.5 h-3 w-3" />
                      Resend
                    </Button>
                  )}
                  {c.status !== 'revoked' && canRevoke && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-[var(--mw-error)]/20 text-[var(--mw-error)] hover:bg-[var(--mw-error)]/5"
                      onClick={() => setRevokeTarget(c)}
                    >
                      <Ban className="mr-1.5 h-3 w-3" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {contacts.length === 0 && (
            <p className="rounded-[var(--shape-md)] border border-dashed border-[var(--border)] py-6 text-center text-sm text-[var(--neutral-500)]">
              No portal users yet. Invite the first one to give them sign-in access.
            </p>
          )}
        </div>

        {pendingInvites.length > 0 && (
          <div className="mt-5 rounded-[var(--shape-md)] border border-[var(--mw-yellow-200)] bg-[var(--mw-yellow-50)] p-3">
            <p className="text-xs font-medium text-[var(--mw-yellow-700)]">
              {pendingInvites.length} invitation
              {pendingInvites.length === 1 ? '' : 's'} pending
            </p>
            <p className="text-[11px] text-[var(--mw-yellow-700)]/80">
              Invite links expire 14 days after sending.
            </p>
          </div>
        )}
      </Card>

      {/* Invite dialog */}
      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        customerId={customerId}
        customerCompany={customerCompany}
        onInvited={refresh}
      />

      {/* Revoke confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke portal access for {revokeTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will be signed out on their next page load and can no longer
              view anything in the {customerCompany} portal. You can re-invite
              them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Reason (optional)</Label>
            <Input
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. No longer employed by the customer"
              className="h-10"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90"
            >
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Invite dialog ────────────────────────────────────────────

function InviteDialog({
  open,
  onOpenChange,
  customerId,
  customerCompany,
  onInvited,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customerId: string;
  customerCompany: string;
  onInvited: () => void;
}) {
  const { identity } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CustomerContactRole>('team');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setTitle('');
    setPhone('');
    setRole('team');
    setSubmitting(false);
  };

  const handleInvite = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const actorId =
        identity.kind === 'internal' ? identity.user.id : identity.contact.id;
      portalAccessService.invite({
        customerId,
        name: name.trim(),
        email: email.trim(),
        title: title.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        invitedByEmployeeId: actorId,
      });
      toast.success('Invitation sent', {
        description: `${email} will receive a portal sign-in link. Link expires in 14 days.`,
      });
      onInvited();
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Invite portal user</DialogTitle>
          <DialogDescription>
            They&rsquo;ll receive an email with a sign-in link to the{' '}
            {customerCompany} portal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jamie Alvarez"
              className="h-10"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Work email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jamie@customer.com"
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Procurement Lead"
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Phone (optional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61…"
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Portal role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as CustomerContactRole)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Admin — can invite, pay, cancel, everything
                </SelectItem>
                <SelectItem value="lead">
                  Lead — can review quotes + view billing, no cancel
                </SelectItem>
                <SelectItem value="team">
                  Team — view-only, cannot post comments
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={submitting}
            onClick={handleInvite}
            className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
          >
            {submitting ? 'Sending…' : 'Send invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
