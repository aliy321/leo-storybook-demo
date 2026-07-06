import { Component, Prop, Host, h } from '@stencil/core';
import {
  alertWebClassName,
  getAlertVariantTokens,
  resolveAlertIconType,
  shouldRenderAlertIcon,
  type AlertVariant,
} from '@leo/ui/alert';

@Component({ tag: 'leo-alert', styleUrl: 'alert.web.css', shadow: true })
export class LeoAlert {
  @Prop() variant: AlertVariant = 'default';
  @Prop({ attribute: 'icon-type' }) iconType?: string;

  private renderIcon() {
    if (!shouldRenderAlertIcon(this.iconType)) return null;

    const tokens = getAlertVariantTokens(this.variant);
    const resolvedType = resolveAlertIconType(this.variant, this.iconType);

    return (
      <leo-icon type={resolvedType} size={16} color={tokens.iconColor} />
    );
  }

  render() {
    return (
      <Host data-variant={this.variant}>
        <div
          class={alertWebClassName({ variant: this.variant })}
          role="alert"
          data-slot="alert"
        >
          <div class="alert-header">
            <div class="alert-icon">{this.renderIcon()}</div>
            <slot name="title"></slot>
          </div>
          <div class="alert-body">
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
