/**
 * Shared inline edit primitives — Field (read-only), EditField (text input),
 * EditSelect (dropdown), EditTextarea (multi-line). Used by EditableCard and
 * any detail page that swaps display-mode and edit-mode views of the same
 * data. Extracted from SellCustomerDetail (commit f302bee1).
 */

import * as React from 'react';
import { Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';

// ── Read-only Field ─────────────────────────────────────────────────

export interface FieldProps {
  label: string;
  value: React.ReactNode;
  /** Render value with tabular-nums (currencies, IDs). */
  mono?: boolean;
  /** Render as an external link (also surfaces a globe icon). */
  link?: boolean;
  className?: string;
}

export function Field({ label, value, mono, link, className }: FieldProps) {
  return (
    <div className={className}>
      <span className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">{label}</span>
      {link && typeof value === 'string' ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-foreground hover:underline"
        >
          <Globe className="h-4 w-4" /> {value.replace(/^https?:\/\//, '')}
        </a>
      ) : (
        <p className={cn('text-sm text-foreground', mono && 'tabular-nums')}>{value || '—'}</p>
      )}
    </div>
  );
}

// ── Editable single-line input ──────────────────────────────────────

export interface EditFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  prefix?: string;
  className?: string;
  disabled?: boolean;
}

export function EditField({
  label,
  value,
  onChange,
  placeholder,
  type,
  mono,
  required,
  icon,
  prefix,
  className,
  disabled,
}: EditFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--mw-error)]">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-500)]">
            {icon}
          </span>
        )}
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--neutral-500)]">
            {prefix}
          </span>
        )}
        <Input
          type={type ?? 'text'}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn((icon || prefix) && 'pl-9', mono && 'tabular-nums')}
        />
      </div>
    </div>
  );
}

// ── Editable select ─────────────────────────────────────────────────

export interface EditSelectOption {
  value: string;
  label: string;
}

export interface EditSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | EditSelectOption)[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function EditSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  className,
  disabled,
}: EditSelectProps) {
  const normalised: EditSelectOption[] = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o.charAt(0).toUpperCase() + o.slice(1) } : o,
  );
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--mw-error)]">*</span>}
      </label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? 'Select…'} />
        </SelectTrigger>
        <SelectContent>
          {normalised.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Editable textarea ───────────────────────────────────────────────

export interface EditTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function EditTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  className,
  disabled,
}: EditTextareaProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--mw-error)]">*</span>}
      </label>
      <Textarea
        value={value}
        rows={rows}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
