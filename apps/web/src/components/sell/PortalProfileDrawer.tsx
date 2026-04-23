/**
 * PortalProfileDrawer — self-service edit drawer for portal users.
 *
 * Surfaces two forms in a side-sheet:
 *   1. Shipping / billing address for the customer (mirrors Odoo portal's
 *      "My addresses" section).
 *   2. The active contact's own profile (name, email, phone, title).
 *
 * Separation of concerns:
 *   - Address writes mutate the Customer record directly (mock) — the real
 *     impl is `sellService.updateCustomer`.
 *   - Contact writes flow through `portalAccessService.updateContact` so the
 *     audit trail picks them up.
 *
 * Gated by the `allowProfileEdit` portal preference (set per-customer in
 * Sell → Settings → Portal). If the preference is off we don't even mount
 * this component — the call site handles that.
 *
 * The drawer is intentionally read-lite: we only edit fields the customer
 * "owns". Billing tier, invoices, company legal name, etc. remain internal.
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, User, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { customers, portalAccessService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type { CustomerContact } from '@/types/entities';

interface PortalProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
}

interface AddressDraft {
  address: string;
  city: string;
  state: string;
  postcode: string;
}

interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  title: string;
}

/**
 * Pick the "acting" contact for edits:
 *   - If internal is impersonating, edit the first admin-role contact.
 *   - Otherwise (real customer login), edit the logged-in contact.
 * Fall back to the first contact in the list.
 */
function resolveActiveContact(
  contacts: CustomerContact[],
  identityContactId?: string,
): CustomerContact | undefined {
  if (identityContactId) {
    const match = contacts.find((c) => c.id === identityContactId);
    if (match) return match;
  }
  return (
    contacts.find((c) => c.role === 'admin' && c.status === 'active') ??
    contacts.find((c) => c.status === 'active') ??
    contacts[0]
  );
}

export function PortalProfileDrawer({
  open,
  onOpenChange,
  customerId,
}: PortalProfileDrawerProps) {
  const { identity } = useAuth();

  const customer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customerId],
  );

  const contacts = useMemo(
    () => portalAccessService.listContacts(customerId),
    [customerId, open], // re-resolve when the drawer opens
  );

  const activeContact = useMemo(
    () =>
      resolveActiveContact(
        contacts,
        identity.kind === 'customer' ? identity.contact.id : undefined,
      ),
    [contacts, identity],
  );

  const [address, setAddress] = useState<AddressDraft>({
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    state: customer?.state ?? '',
    postcode: customer?.postcode ?? '',
  });

  const [contact, setContact] = useState<ContactDraft>({
    name: activeContact?.name ?? '',
    email: activeContact?.email ?? '',
    phone: activeContact?.phone ?? '',
    title: activeContact?.title ?? '',
  });

  // Reseed drafts whenever the drawer reopens or the customer changes.
  useEffect(() => {
    if (!open) return;
    setAddress({
      address: customer?.address ?? '',
      city: customer?.city ?? '',
      state: customer?.state ?? '',
      postcode: customer?.postcode ?? '',
    });
    setContact({
      name: activeContact?.name ?? '',
      email: activeContact?.email ?? '',
      phone: activeContact?.phone ?? '',
      title: activeContact?.title ?? '',
    });
  }, [open, customer, activeContact]);

  const [saving, setSaving] = useState(false);

  const addressDirty =
    customer !== undefined &&
    (address.address !== customer.address ||
      address.city !== customer.city ||
      address.state !== customer.state ||
      address.postcode !== customer.postcode);

  const contactDirty =
    activeContact !== undefined &&
    (contact.name !== (activeContact.name ?? '') ||
      contact.email !== (activeContact.email ?? '') ||
      contact.phone !== (activeContact.phone ?? '') ||
      contact.title !== (activeContact.title ?? ''));

  const dirty = addressDirty || contactDirty;

  const handleSave = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      if (addressDirty) {
        // Mock mutation — production: sellService.updateCustomer(customer.id, ...)
        customer.address = address.address;
        customer.city = address.city;
        customer.state = address.state;
        customer.postcode = address.postcode;
      }

      if (contactDirty && activeContact) {
        portalAccessService.updateContact(activeContact.id, {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
        });
      }

      toast.success('Profile saved', {
        description: [
          addressDirty && 'Shipping address',
          contactDirty && 'Contact details',
        ]
          .filter(Boolean)
          .join(' · '),
      });
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to save profile', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Profile &amp; address</SheetTitle>
          <SheetDescription>
            Keep your contact and shipping details up to date. Changes apply
            to every order and invoice from now on.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Shipping address */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)] text-[var(--neutral-700)]">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold">Shipping / billing address</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  Used as default for new orders and invoices.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1">
                <Label htmlFor="profile-address">Street address</Label>
                <Input
                  id="profile-address"
                  value={address.address}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, address: e.target.value }))
                  }
                  placeholder="123 Industrial Way"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    value={address.city}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-state">State</Label>
                  <Input
                    id="profile-state"
                    value={address.state}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, state: e.target.value }))
                    }
                    placeholder="NSW"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-postcode">Postcode</Label>
                <Input
                  id="profile-postcode"
                  value={address.postcode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, postcode: e.target.value }))
                  }
                  className="max-w-[140px]"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Contact profile */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)] text-[var(--neutral-700)]">
                <User className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold">Your contact details</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  {activeContact
                    ? `Editing ${activeContact.name} (${activeContact.role})`
                    : 'No active contact resolved.'}
                </p>
              </div>
            </div>

            {activeContact ? (
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    value={contact.name}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, email: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, phone: e.target.value }))
                      }
                      placeholder="+61 ..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profile-title">Title</Label>
                    <Input
                      id="profile-title"
                      value={contact.title}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, title: e.target.value }))
                      }
                      placeholder="Procurement Lead"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-[var(--shape-md)] border border-dashed border-[var(--border)] px-3 py-4 text-xs text-[var(--neutral-500)]">
                We couldn't find a contact for you on this customer. Ask
                your admin to invite you from Sell → Customers → Contacts.
              </p>
            )}
          </section>
        </div>

        <SheetFooter className="border-t border-[var(--border)] bg-[var(--neutral-50)] px-6 py-3">
          <SheetClose asChild>
            <Button variant="outline" size="sm" disabled={saving}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
