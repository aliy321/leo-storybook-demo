import * as React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import {
  alertHeaderClass,
  alertNativeClassName,
  alertNativeIconClassName,
  alertNativeIconInlineClass,
  alertTextContextClass,
  cn,
  resolveAlertIconType,
  shouldRenderAlertIcon,
  type AlertOptions,
  type AlertVariant,
} from '@leo/ui/alert';
import { Icon } from '../../icon/native/icon.native';
import { AlertTextClassContext } from './AlertTextContext';
import { AlertTitle } from './AlertTitle';
import {
  alertHeaderNativeStyle,
  alertIconSlotNativeStyle,
} from './alert.native.layout';

export interface AlertProps extends AlertOptions, ViewProps {
  /** Leo icon name from `@leo/tokens/icons`. Defaults from variant. */
  iconType?: string;
  iconClassName?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

function isAlertTitleElement(child: React.ReactNode): child is React.ReactElement {
  if (!React.isValidElement(child)) {
    return false;
  }

  const type = child.type as { displayName?: string };
  return type === AlertTitle || type.displayName === 'AlertTitle';
}

function partitionAlertChildren(children: React.ReactNode) {
  const items = React.Children.toArray(children);
  let title: React.ReactNode = null;
  const rest: React.ReactNode[] = [];

  for (const child of items) {
    if (title === null && isAlertTitleElement(child)) {
      title = child;
      continue;
    }

    rest.push(child);
  }

  return { title, rest };
}

export function Alert({
  variant = 'default',
  iconType,
  iconClassName,
  className,
  style,
  children,
  ...props
}: AlertProps) {
  const resolvedIconType = resolveAlertIconType(variant, iconType);
  const showIcon = shouldRenderAlertIcon(iconType);
  const { title, rest } = partitionAlertChildren(children);

  return (
    <AlertTextClassContext.Provider value={alertTextContextClass(variant)}>
      <View
        accessibilityRole="alert"
        {...({
          className: cn(alertNativeClassName({ variant }), className),
        } as object)}
        style={style}
        {...props}
      >
        {title ? (
          <View {...({ className: alertHeaderClass } as object)} style={alertHeaderNativeStyle}>
            {showIcon ? (
              <View
                pointerEvents="none"
                {...({ className: alertNativeIconInlineClass } as object)}
                style={alertIconSlotNativeStyle}
              >
                <Icon
                  type={resolvedIconType}
                  size={16}
                  className={alertNativeIconClassName(variant, iconClassName)}
                  decorative
                />
              </View>
            ) : null}
            {title}
          </View>
        ) : showIcon ? (
          <View
            pointerEvents="none"
            {...({ className: cn(alertHeaderClass, alertNativeIconInlineClass) } as object)}
            style={alertHeaderNativeStyle}
          >
            <View style={alertIconSlotNativeStyle}>
              <Icon
                type={resolvedIconType}
                size={16}
                className={alertNativeIconClassName(variant, iconClassName)}
                decorative
              />
            </View>
          </View>
        ) : null}
        {rest}
      </View>
    </AlertTextClassContext.Provider>
  );
}

Alert.displayName = 'Alert';

export type { AlertVariant };
export { AlertTitle } from './AlertTitle';
export { AlertDescription } from './AlertDescription';
export { AlertMeta } from './AlertMeta';
export { AlertGalleryLabel } from './AlertGalleryLabel';
export { AlertText } from './AlertText';
export { AlertTextClassContext, useAlertTextClass } from './AlertTextContext';
export default Alert;
