import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertGalleryLabel, AlertMeta, AlertTitle } from './alert.native';
import {
  alertContract,
  alertVariantGalleryLabels,
  type AlertOptions,
  type AlertVariant,
} from '@leo/ui/alert';
import {
  ALERT_GALLERY_SECTION_GAP,
  ALERT_GALLERY_STACK_GAP,
  ALERT_GALLERY_STORY_PARAMETERS,
  ALERT_LDS_ACTIONS_CLASS,
  ALERT_LDS_DOWNLOAD_ICON,
  ALERT_LDS_DOWNLOAD_LABEL,
  ALERT_LDS_GALLERY_VARIANTS,
  ALERT_STORY_DEFAULT_ARGS,
  ALERT_STORY_FRAME_NATIVE_STYLE,
  ALERT_STORY_PARAMETERS,
  createAlertStoryArgTypes,
} from '../story-shared';
import { Button } from '../../button/native/button.native';
import { alertActionsNativeStyle } from './alert.native.layout';

interface AlertArgs extends AlertOptions {
  variant: AlertVariant;
  iconType: string;
  title: string;
  description: string;
  meta: string;
  showActions: boolean;
}

function ExampleAlert({
  variant = 'default',
  iconType = '',
  title = ALERT_STORY_DEFAULT_ARGS.title,
  description = ALERT_STORY_DEFAULT_ARGS.description,
  meta = ALERT_STORY_DEFAULT_ARGS.meta,
  showActions = true,
}: Partial<AlertArgs>) {
  return (
    <Alert variant={variant} iconType={iconType || undefined}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <AlertMeta>{meta}</AlertMeta>
      {showActions ? (
        <View className={ALERT_LDS_ACTIONS_CLASS} style={alertActionsNativeStyle}>
          <Button variant="default" size="sm" label="Continue" />
          <Button variant="outline" size="sm" label="Learn more" />
          <Button
            variant="link"
            size="sm"
            label={ALERT_LDS_DOWNLOAD_LABEL}
            leftIconType={ALERT_LDS_DOWNLOAD_ICON}
          />
        </View>
      ) : null}
    </Alert>
  );
}

const meta: Meta<AlertArgs> = {
  title: 'Components/Alert',
  parameters: {
    ...ALERT_STORY_PARAMETERS,
    componentContract: alertContract,
    docs: { page: () => import('../docs/alert.docs.native.mdx') },
  },
  argTypes: createAlertStoryArgTypes(alertContract),
  args: { ...ALERT_STORY_DEFAULT_ARGS },
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Default: Story = {
  render: (args) => (
    <View style={ALERT_STORY_FRAME_NATIVE_STYLE}>
      <ExampleAlert {...args} />
    </View>
  ),
};

export const Variants: Story = {
  parameters: ALERT_GALLERY_STORY_PARAMETERS,
  render: () => (
    <View className="flex-col items-start" style={{ gap: ALERT_GALLERY_STACK_GAP }}>
      {ALERT_LDS_GALLERY_VARIANTS.map((variant) => (
        <View
          key={variant}
          className="w-full max-w-2xl"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: ALERT_GALLERY_SECTION_GAP,
          }}
        >
          <AlertGalleryLabel>{alertVariantGalleryLabels[variant]}</AlertGalleryLabel>
          <ExampleAlert variant={variant} />
        </View>
      ))}
    </View>
  ),
};
