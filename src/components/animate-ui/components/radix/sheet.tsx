import * as React from 'react';

import {
  Sheet as SheetPrimitive,
  SheetTrigger as SheetTriggerPrimitive,
  SheetOverlay as SheetOverlayPrimitive,
  SheetClose as SheetClosePrimitive,
  SheetPortal as SheetPortalPrimitive,
  SheetContent as SheetContentPrimitive,
  SheetHeader as SheetHeaderPrimitive,
  SheetFooter as SheetFooterPrimitive,
  SheetTitle as SheetTitlePrimitive,
  SheetDescription as SheetDescriptionPrimitive,
  type SheetProps as SheetPrimitiveProps,
  type SheetTriggerProps as SheetTriggerPrimitiveProps,
  type SheetOverlayProps as SheetOverlayPrimitiveProps,
  type SheetCloseProps as SheetClosePrimitiveProps,
  type SheetContentProps as SheetContentPrimitiveProps,
  type SheetHeaderProps as SheetHeaderPrimitiveProps,
  type SheetFooterProps as SheetFooterPrimitiveProps,
  type SheetTitleProps as SheetTitlePrimitiveProps,
  type SheetDescriptionProps as SheetDescriptionPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/sheet';
import { cn } from '@/components/ui/utils';
import { X } from 'lucide-react';

type SheetProps = SheetPrimitiveProps;

function Sheet(props: SheetProps) {
  return <SheetPrimitive {...props} />;
}

type SheetTriggerProps = SheetTriggerPrimitiveProps;

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetTriggerPrimitive {...props} />;
}

type SheetOverlayProps = SheetOverlayPrimitiveProps;

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetOverlayPrimitive
      className={cn(
        'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}

type SheetCloseProps = SheetClosePrimitiveProps;

function SheetClose(props: SheetCloseProps) {
  return <SheetClosePrimitive {...props} />;
}

type SheetContentProps = SheetContentPrimitiveProps & {
  showCloseButton?: boolean;
};

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortalPrimitive>
      <SheetOverlay />
      <SheetContentPrimitive
        className={cn(
          'z-50 flex flex-col gap-4 border border-[var(--neutral-200)] bg-white/95 p-6 shadow-lg backdrop-blur-xl',
          side === 'right' &&
            'h-full w-3/4 max-w-sm rounded-l-[var(--shape-lg)] rounded-r-none border-l sm:max-w-sm',
          side === 'left' &&
            'h-full w-3/4 max-w-sm rounded-r-[var(--shape-lg)] rounded-l-none border-r sm:max-w-sm',
          side === 'top' &&
            'h-auto max-h-[85vh] w-full rounded-b-[var(--shape-lg)] rounded-t-none border-b',
          side === 'bottom' &&
            'h-auto max-h-[85vh] w-full rounded-t-[var(--shape-lg)] rounded-b-none border-t',
          className,
        )}
        side={side}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
      </SheetContentPrimitive>
    </SheetPortalPrimitive>
  );
}

type SheetHeaderProps = SheetHeaderPrimitiveProps;

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <SheetHeaderPrimitive
      className={cn(
        'flex flex-col space-y-2 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  );
}

type SheetFooterProps = SheetFooterPrimitiveProps;

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <SheetFooterPrimitive
      className={cn(
        'mt-auto flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
      {...props}
    />
  );
}

type SheetTitleProps = SheetTitlePrimitiveProps;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetTitlePrimitive
      className={cn('text-lg font-bold text-foreground', className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = SheetDescriptionPrimitiveProps;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetDescriptionPrimitive
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
};
