/**
 * MwFormField — Design-system-enforced form field wrapper
 *
 * Provides consistent layout (label, input, description, error) with
 * proper spacing per the M3 8px grid. Works with react-hook-form via
 * the ShadCN Form primitives, or standalone with plain inputs.
 *
 * Accessibility: description and error text are programmatically associated
 * with the input via `aria-describedby`, and required fields are marked with
 * `aria-required` on the cloned child input (in addition to the visual `*`).
 * WCAG 3.3.1 (Error Identification) and 3.3.2 (Labels or Instructions) — AA.
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
  const reactId = React.useId();
  const fieldId = htmlFor ?? `field-${reactId}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

  // Clone the child input to inject id, aria-describedby, aria-invalid and
  // aria-required. Falls back gracefully if the child isn't an element.
  const child = React.Children.only(children);
  const enhancedChild = React.isValidElement(child)
    ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        id: (child.props as { id?: string }).id ?? fieldId,
        "aria-describedby":
          [(child.props as { ["aria-describedby"]?: string })["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : (child.props as { ["aria-invalid"]?: boolean })["aria-invalid"],
        "aria-required": required || (child.props as { ["aria-required"]?: boolean })["aria-required"],
      })
    : children;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label
        htmlFor={fieldId}
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

      {enhancedChild}

      {description && !error && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
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
