import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Shared "how access is resolved" hint. Drop into Groups surfaces to make the
 * union semantics discoverable without forcing users to read docs.
 */
export function AccessResolutionPopover({ label = 'How access is resolved' }: { label?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-[var(--neutral-500)] hover:text-[var(--neutral-800)]"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-xs leading-relaxed">
        <p className="mb-2 text-sm font-medium text-foreground">Conflict rules</p>
        <ul className="space-y-1.5 text-[var(--neutral-600)]">
          <li>
            <span className="font-medium text-foreground">Allow wins.</span> If any group the user
            belongs to grants a permission, they have it.
          </li>
          <li>
            <span className="font-medium text-foreground">Broader scope wins.</span> If one group says
            <em> all records</em> and another says <em>own</em>, the user sees <em>all</em>.
          </li>
          <li>
            <span className="font-medium text-foreground">Module lead &amp; super admin</span> bypass
            groups entirely — they get full access in the module(s) they lead.
          </li>
          <li>
            <span className="font-medium text-foreground">Deactivated users</span> have no effective
            permissions, regardless of group membership.
          </li>
        </ul>
        <p className="mt-3 text-[var(--neutral-500)]">
          There is no explicit deny. To revoke access, remove the user from the group that grants it.
        </p>
      </PopoverContent>
    </Popover>
  );
}
