/**
 * MwFormField — Design-system-enforced form field wrapper
 *
 * Provides consistent layout (label, input, description, error) with
 * proper spacing per the M3 8px grid. Works with react-hook-form via
 * the ShadCN Form primitives, or standalone with plain inputs.
 */

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Label } from "@/components/ui/label";

interface MwFormFieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function MwFormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className,
  children,
}: MwFormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium",
          error && "text-destructive",
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        )}
      </Label>

      {children}

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface MwFormSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

function MwFormSection({
  title,
  description,
  className,
  children,
}: MwFormSectionProps) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <legend className="text-base font-medium text-foreground">
              {title}
            </legend>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

interface MwFormActionsProps {
  className?: string;
  children: React.ReactNode;
}

function MwFormActions({ className, children }: MwFormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-4 border-t border-[var(--neutral-200)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { MwFormField, MwFormSection, MwFormActions };
