/**
 * Branding & defaults section — branding theme + invoice push status +
 * default due-date offset + reference template.
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SectionShell } from './SectionShell';
import type { BrandingDefaults, XeroBrandingTheme } from '@/types/xero';

export interface BrandingSectionProps {
  defaults: BrandingDefaults;
  brandingThemes: XeroBrandingTheme[];
  onChange: (next: BrandingDefaults) => void;
}

const STATUS_OPTIONS: {
  value: BrandingDefaults['defaultInvoiceStatus'];
  label: string;
  hint: string;
}[] = [
  { value: 'DRAFT',      label: 'Draft',      hint: 'Saved but not visible to customers' },
  { value: 'SUBMITTED',  label: 'Submitted',  hint: 'Awaiting approval in Xero' },
  { value: 'AUTHORISED', label: 'Authorised', hint: 'Approved and ready to send' },
];

export function BrandingSection({
  defaults,
  brandingThemes,
  onChange,
}: BrandingSectionProps) {
  return (
    <SectionShell
      title="Branding & defaults"
      description="Defaults applied to every invoice and credit note pushed to Xero."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="invoice-theme" className="text-xs">
            Invoice branding theme
          </Label>
          <Select
            value={defaults.invoiceBrandingThemeId}
            onValueChange={(v) =>
              onChange({ ...defaults, invoiceBrandingThemeId: v })
            }
          >
            <SelectTrigger id="invoice-theme" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brandingThemes.map((t) => (
                <SelectItem key={t.BrandingThemeID} value={t.BrandingThemeID}>
                  {t.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cn-theme" className="text-xs">
            Credit note branding theme
          </Label>
          <Select
            value={defaults.creditNoteBrandingThemeId}
            onValueChange={(v) =>
              onChange({ ...defaults, creditNoteBrandingThemeId: v })
            }
          >
            <SelectTrigger id="cn-theme" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brandingThemes.map((t) => (
                <SelectItem key={t.BrandingThemeID} value={t.BrandingThemeID}>
                  {t.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice-status" className="text-xs">
            Default invoice status on push
          </Label>
          <Select
            value={defaults.defaultInvoiceStatus}
            onValueChange={(v) =>
              onChange({
                ...defaults,
                defaultInvoiceStatus:
                  v as BrandingDefaults['defaultInvoiceStatus'],
              })
            }
          >
            <SelectTrigger id="invoice-status" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span className="flex flex-col">
                    <span>{s.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {s.hint}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due-offset" className="text-xs">
            Default due-date offset (days)
          </Label>
          <Input
            id="due-offset"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            className="h-9 text-sm"
            value={defaults.defaultDueDateOffsetDays}
            onChange={(e) =>
              onChange({
                ...defaults,
                defaultDueDateOffsetDays: Math.max(
                  0,
                  Math.min(120, Number(e.target.value) || 0),
                ),
              })
            }
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="ref-template" className="text-xs">
            Reference template
          </Label>
          <Input
            id="ref-template"
            className="h-9 font-mono text-sm"
            value={defaults.referenceTemplate}
            onChange={(e) =>
              onChange({ ...defaults, referenceTemplate: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Available placeholders:{' '}
            {['{invoiceNumber}', '{poNumber}', '{jobCode}'].map((tok) => (
              <Badge
                key={tok}
                variant="outline"
                className="ml-1 rounded-full font-mono text-[10px] font-normal"
              >
                {tok}
              </Badge>
            ))}
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
