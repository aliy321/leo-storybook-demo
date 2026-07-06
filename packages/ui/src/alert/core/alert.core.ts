import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/** LDS semantic alert types shown in Figma. */
export const LDS_ALERT_VARIANTS = [
  'default',
  'info',
  'error',
  'warning',
  'success',
] as const;

export type AlertVariant = (typeof LDS_ALERT_VARIANTS)[number];

export const alertVariantValues = [...LDS_ALERT_VARIANTS] as AlertVariant[];

/** LDS-leading alert icons from `@leo/tokens/icons`. */
export const alertIconTypeValues = [
  'question',
  'help',
  'info',
  'info-outline',
  'information',
  'information-outline',
  'alert',
  'warning',
  'success',
  'check',
  'check-fill',
] as const;

export type AlertIconType = (typeof alertIconTypeValues)[number];

/** Storybook select: empty string = variant default icon. */
export const ALERT_ICON_TYPE_VARIANT_DEFAULT = '';

export function resolveAlertIconType(
  variant: AlertVariant = 'default',
  iconType?: string,
): string {
  if (!iconType || iconType === ALERT_ICON_TYPE_VARIANT_DEFAULT) {
    return alertDefaultIconType[variant];
  }

  return iconType;
}

export function shouldRenderAlertIcon(iconType?: string): boolean {
  return iconType !== 'none';
}

export const alertIconTypeStoryOptions = [
  ALERT_ICON_TYPE_VARIANT_DEFAULT,
  ...alertIconTypeValues,
] as const;

export interface AlertVariantTokens {
  shellClass: string;
  defaultIconType: string;
  /** `leo-icon` `color` prop (web). */
  iconColor: string;
  /** NativeWind class on the icon glyph. */
  iconTextClass: string;
  textContextClass: string;
}

const alertVariantTokenMap = {
  default: {
    shellClass: 'bg-card border-border text-card-foreground',
    defaultIconType: 'question',
    iconColor: 'primary',
    iconTextClass: 'text-primary',
    textContextClass: 'text-foreground',
  },
  info: {
    shellClass: 'bg-info-muted border-info text-foreground',
    defaultIconType: 'info',
    iconColor: 'info',
    iconTextClass: 'text-info',
    textContextClass: 'text-foreground',
  },
  error: {
    shellClass: 'bg-error-muted border-destructive text-destructive',
    defaultIconType: 'alert',
    iconColor: 'destructive',
    iconTextClass: 'text-destructive',
    textContextClass: 'text-destructive',
  },
  warning: {
    shellClass: 'bg-warning-muted border-warning text-foreground',
    defaultIconType: 'warning',
    iconColor: 'warning',
    iconTextClass: 'text-warning',
    textContextClass: 'text-foreground',
  },
  success: {
    shellClass: 'bg-success-muted border-success text-foreground',
    defaultIconType: 'success',
    iconColor: 'success',
    iconTextClass: 'text-success',
    textContextClass: 'text-foreground',
  },
} as const satisfies Record<AlertVariant, AlertVariantTokens>;

export function getAlertVariantTokens(
  variant: AlertVariant = 'default',
): AlertVariantTokens {
  return alertVariantTokenMap[variant];
}

export const alertVariantGalleryLabels: Record<AlertVariant, string> = {
  default: 'Default',
  info: 'Info',
  error: 'Alert',
  warning: 'Warning',
  success: 'Success',
};

const alertVariantMap = Object.fromEntries(
  LDS_ALERT_VARIANTS.map((variant) => [
    variant,
    alertVariantTokenMap[variant].shellClass,
  ]),
) as Record<AlertVariant, string>;

/** Root variant styles (shared). Platform shells add layout classes separately. */
export const alertVariants = cva(
  'relative w-full rounded-lg border text-14 shadow-md',
  {
  variants: {
    variant: alertVariantMap,
  },
  defaultVariants: {
    variant: 'default',
  },
});

/** LDS shell — uniform padding on all sides (v2 / Figma). */
export const alertNativeShellClass =
  'relative w-full rounded-lg border p-4';

/** Icon + title row — `items-center` vertically aligns glyph with title. */
export const alertHeaderClass =
  'mb-1 flex w-full flex-row items-center gap-2';

export const alertNativeIconInlineClass = 'shrink-0';

export function alertNativeIconClassName(
  variant: AlertVariant = 'default',
  iconClassName?: string,
): string {
  const { iconTextClass } = getAlertVariantTokens(variant);
  return cn('size-4', iconTextClass, iconClassName);
}

/** Web shell matches native layout. */
export const alertWebShellClass = alertNativeShellClass;

export const alertTitleVariants = cva(
  'min-h-4 text-16 font-bold leading-none tracking-tight',
);

export const alertTitleWebVariants = alertTitleVariants;

export const alertDescriptionVariants = cva(
  'text-muted-foreground ml-0.5 pb-1.5 pl-6 text-14 leading-[18px]',
);

export const alertDescriptionWebVariants = cva(
  'text-muted-foreground ml-0.5 pb-1.5 text-14 leading-[18px]',
);

/** LDS footnote line — smaller than body (`footnote-lg` / 12px). */
export const alertMetaVariants = cva(
  'text-footnote ml-0.5 pb-1.5 pl-6 text-12 leading-12',
);

export const alertMetaWebVariants = cva(
  'text-footnote ml-0.5 pb-1.5 text-12 leading-12',
);

export interface AlertOptions {
  variant?: AlertVariant;
  className?: string;
}

export interface AlertClassNameOptions extends AlertOptions {}

export function alertClassName({
  variant = 'default',
  className,
}: AlertClassNameOptions = {}): string {
  return cn(alertVariants({ variant }), className);
}

export function alertWebClassName({
  variant = 'default',
  className,
}: AlertClassNameOptions = {}): string {
  return cn(alertClassName({ variant }), alertWebShellClass, className);
}

export function alertNativeClassName({
  variant = 'default',
  className,
}: AlertClassNameOptions = {}): string {
  return cn(alertClassName({ variant }), alertNativeShellClass, className);
}

/** `TextClassContext` value on native `Alert` root. */
export function alertTextContextClass(
  variant: AlertVariant = 'default',
  className?: string,
): string {
  const { textContextClass } = getAlertVariantTokens(variant);
  return cn('text-14', textContextClass, className);
}

export function alertTitleClassName({
  className,
}: { className?: string } = {}): string {
  return cn(alertTitleVariants(), className);
}

export function alertTitleWebClassName({
  className,
}: { className?: string } = {}): string {
  return cn(alertTitleWebVariants(), className);
}

export function alertDescriptionClassName({
  variant: _variant = 'default',
  textContextClass,
  className,
}: {
  variant?: AlertVariant;
  textContextClass?: string;
  className?: string;
} = {}): string {
  return cn(
    alertDescriptionVariants(),
    textContextClass?.includes('text-destructive') && 'text-destructive/90',
    className,
  );
}

export function alertDescriptionWebClassName({
  variant = 'default',
  className,
}: {
  variant?: AlertVariant;
  className?: string;
} = {}): string {
  return cn(
    alertDescriptionWebVariants(),
    variant === 'error' && 'text-destructive/90',
    className,
  );
}

export function alertMetaClassName({
  className,
}: { className?: string } = {}): string {
  return cn(alertMetaVariants(), className);
}

export function alertMetaWebClassName({
  className,
}: { className?: string } = {}): string {
  return cn(alertMetaWebVariants(), className);
}

/** Default Leo icon per variant when `iconType` is omitted. */
export const alertDefaultIconType: Record<AlertVariant, string> =
  Object.fromEntries(
    LDS_ALERT_VARIANTS.map((variant) => [
      variant,
      alertVariantTokenMap[variant].defaultIconType,
    ]),
  ) as Record<AlertVariant, string>;
