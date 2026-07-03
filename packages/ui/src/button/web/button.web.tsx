import { Component, Prop, h, Host } from '@stencil/core';
import {
  getIconSvg,
  iconSizeClass,
  isColorIcon,
  resolveIconName,
} from '@leo/ui/icon';
import {
  buttonRippleVariantClass,
  buttonTextVariants,
  buttonVariants,
  cn,
  type ButtonSize,
  type ButtonVariant,
} from '@leo/ui/button';
import { attachButtonRipple } from './button-ripple.web';

@Component({ tag: 'leo-button', styleUrl: 'button.web.css', shadow: true })
export class LeoButton {
  @Prop() variant: ButtonVariant = 'default';
  @Prop() size: ButtonSize = 'default';
  @Prop({ attribute: 'disabled' }) disabled = false;
  @Prop() label = 'Button';
  @Prop({ attribute: 'left-icon-type' }) leftIconType?: string;
  @Prop({ attribute: 'right-icon-type' }) rightIconType?: string;

  private buttonEl?: HTMLButtonElement;
  private rippleHolderEl?: HTMLSpanElement;
  private detachRipple?: () => void;

  private get isIconOnly() {
    return this.size === 'icon';
  }

  private get resolvedIconType() {
    return this.leftIconType ?? this.rightIconType ?? 'search';
  }

  private get accessibleName() {
    const label = this.label?.trim();
    if (label) return label;
    return this.leftIconType ?? this.rightIconType ?? 'search';
  }

  private get showRipple() {
    return !this.disabled && this.variant !== 'link';
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

    if (!this.showRipple || !this.buttonEl || !this.rippleHolderEl) {
      return;
    }

    this.detachRipple = attachButtonRipple(this.buttonEl, this.rippleHolderEl);
  }

  private teardownRipple() {
    this.detachRipple?.();
    this.detachRipple = undefined;
  }

  private renderIcon(type: string | undefined, textClassName: string) {
    if (!type || !resolveIconName(type)) return null;

    return (
      <span
        class={cn(
          'button-icon inline-flex shrink-0',
          iconSizeClass(16),
          textClassName,
          isColorIcon(type) && 'button-icon--color',
        )}
        innerHTML={getIconSvg(type)}
        aria-hidden="true"
      />
    );
  }

  private renderRipple() {
    if (!this.showRipple) return null;

    return (
      <span
        ref={(el) => {
          this.rippleHolderEl = el as HTMLSpanElement | undefined;
        }}
        class={cn('button-ripple', buttonRippleVariantClass[this.variant])}
        aria-hidden="true"
      />
    );
  }

  private renderContent(textClassName: string) {
    if (this.isIconOnly) {
      return <slot>{this.renderIcon(this.resolvedIconType, textClassName)}</slot>;
    }

    return [
      this.renderIcon(this.leftIconType, textClassName),
      <span class={textClassName}>
        <slot>{this.label}</slot>
      </span>,
      this.renderIcon(this.rightIconType, textClassName),
    ];
  }

  render() {
    const buttonClassName = cn(
      buttonVariants({
        variant: this.variant,
        size: this.size,
      }),
      this.isIconOnly && 'button--icon',
    );
    const textClassName = buttonTextVariants({
      variant: this.variant,
      size: this.size,
    });

    if (this.isIconOnly) {
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
            aria-label={this.accessibleName}
          >
            {this.renderRipple()}
            <span class="button-content">{this.renderContent(textClassName)}</span>
          </button>
        </Host>
      );
    }

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
          <span class="button-content">{this.renderContent(textClassName)}</span>
        </button>
      </Host>
    );
  }
}
