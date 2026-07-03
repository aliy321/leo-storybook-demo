import { Component, Prop, Host, h, Event, EventEmitter, Listen } from '@stencil/core';
import {
  cardClassName,
  cardRippleVariantClass,
  type CardVariant,
} from '../core/card.core';
import { cn } from '../../lib/cn';
import { attachButtonRipple } from '../../button/web/button-ripple.web';

@Component({ tag: 'leo-card', styleUrl: 'card.web.css', shadow: true })
export class LeoCard {
  @Prop() variant: CardVariant = 'elevated';
  @Prop() hasPadding = true;
  @Prop() hasRipple = false;
  @Prop({ attribute: 'disabled' }) disabled = false;

  @Event({ eventName: 'leoCardClick' }) click!: EventEmitter;

  private cardEl?: HTMLDivElement;
  private rippleHolderEl?: HTMLSpanElement;
  private detachRipple?: () => void;

  private get showRipple() {
    return this.hasRipple && !this.disabled;
  }

  componentDidLoad() {
    this.setupRipple();
  }

  componentDidUpdate() {
    this.setupRipple();
  }

  disconnectedCallback() {
    this.teardownRipple();
  }

  private setupRipple() {
    this.teardownRipple();

    if (!this.showRipple || !this.cardEl || !this.rippleHolderEl) {
      return;
    }

    this.detachRipple = attachButtonRipple(this.cardEl, this.rippleHolderEl);
  }

  private teardownRipple() {
    this.detachRipple?.();
    this.detachRipple = undefined;
  }

  @Listen('click', { capture: true })
  onClick() {
    if (this.disabled) return;
    this.click.emit({
      component: this,
      data: {},
    });
  }

  private renderRipple() {
    if (!this.showRipple) return null;

    return (
      <span
        ref={(el) => {
          this.rippleHolderEl = el as HTMLSpanElement | undefined;
        }}
        class={cn('card-ripple', cardRippleVariantClass[this.variant])}
        aria-hidden="true"
      />
    );
  }

  render() {
    const className = cardClassName({
      variant: this.variant,
      hasPadding: this.hasPadding,
      disabled: this.disabled,
      hasRipple: this.hasRipple,
    });

    return (
      <Host>
        <div
          ref={(el) => {
            this.cardEl = el as HTMLDivElement | undefined;
          }}
          class={className}
          aria-disabled={this.disabled ? 'true' : 'false'}
        >
          {this.renderRipple()}
          <div class="card-content">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
