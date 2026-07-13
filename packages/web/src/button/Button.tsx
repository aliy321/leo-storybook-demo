import { Component, Prop, h, Host } from '@stencil/core';
import {
  buttonVariants,
  cn,
  type ButtonSize,
  type ButtonVariant,
} from './button.variants';
import { attachButtonRipple } from './button-ripple';

const rippleClassByVariant: Record<ButtonVariant, string> = {
  default: 'button-ripple--on-dark',
  destructive: 'button-ripple--on-light',
  secondary: 'button-ripple--on-light',
  outline: 'button-ripple--on-light',
  ghost: 'button-ripple--on-light',
  link: '',
};

@Component({ tag: 'leo-button', styleUrl: 'Button.css', shadow: true })
export class LeoButton {
  @Prop() variant: ButtonVariant = 'default';
  @Prop() size: ButtonSize = 'default';
  @Prop({ attribute: 'disabled' }) disabled = false;
  @Prop() label = 'Button';

  private buttonEl?: HTMLButtonElement;
  private rippleHolderEl?: HTMLSpanElement;
  private detachRipple?: () => void;

  private get showRipple(): boolean {
    return !this.disabled && this.variant !== 'link';
  }

  componentDidLoad(): void {
    this.setupRipple();
  }

  componentDidUpdate(): void {
    this.setupRipple();
  }

  disconnectedCallback(): void {
    this.teardownRipple();
  }

  private setupRipple(): void {
    this.teardownRipple();

    if (!this.showRipple || !this.buttonEl || !this.rippleHolderEl) {
      return;
    }

    this.detachRipple = attachButtonRipple(this.buttonEl, this.rippleHolderEl);
  }

  private teardownRipple(): void {
    this.detachRipple?.();
    this.detachRipple = undefined;
  }

  private renderRipple() {
    if (!this.showRipple) return null;

    return (
      <span
        ref={(el) => {
          this.rippleHolderEl = el as HTMLSpanElement | undefined;
        }}
        class={cn('button-ripple', rippleClassByVariant[this.variant])}
        aria-hidden="true"
      />
    );
  }

  render() {
    const buttonClassName = cn(
      buttonVariants({
        variant: this.variant,
        size: this.size,
      }),
    );

    return (
      <Host>
        <button
          ref={(el) => {
            this.buttonEl = el as HTMLButtonElement | undefined;
          }}
          type="button"
          class={buttonClassName}
          disabled={this.disabled}
          aria-disabled={this.disabled ? 'true' : 'false'}
        >
          {this.renderRipple()}
          <span class="button-content">
            <slot>{this.label}</slot>
          </span>
        </button>
      </Host>
    );
  }
}
