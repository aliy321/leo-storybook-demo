import { Component, Prop, Host, h, Event, EventEmitter, Listen } from '@stencil/core';
import {
  badgeClassName,
  type BadgeVariant,
} from '@leo/ui/badge';

@Component({ tag: 'leo-badge', styleUrl: 'badge.web.css', shadow: true })
export class LeoBadge {
  @Prop() variant: BadgeVariant = 'default';
  @Prop({ attribute: 'disabled' }) disabled = false;

  @Event({ eventName: 'leoBadgeClick' }) click!: EventEmitter;

  @Listen('click', { capture: true })
  onClick() {
    if (this.disabled) return;
    this.click.emit({
      component: this,
      data: {},
    });
  }

  render() {
    const className = badgeClassName({
      variant: this.variant,
      disabled: this.disabled,
    });

    return (
      <Host>
        <div
          class={className}
          aria-disabled={this.disabled ? 'true' : 'false'}
        >
          <div class="badge-content">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
