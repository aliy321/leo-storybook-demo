import { Component, Prop, h, Host } from '@stencil/core';
import {
  getIconSvg,
  iconSizeClass,
  isColorIcon,
  resolveIconName,
} from '../core/icon.core';

@Component({ tag: 'leo-icon', styleUrl: 'icon.web.css', shadow: false, scoped: false })
export class LeoIcon {
  @Prop() color = 'primary';
  @Prop() size: number | string = 24;
  @Prop() type = '';
  @Prop() width?: string;
  @Prop() height?: string;

  private generateSvgHtml(): string {
    if (!resolveIconName(this.type)) return '';
    return getIconSvg(this.type, this.width, this.height);
  }

  render() {
    const classes = [
      'leo-icon',
      this.size ? iconSizeClass(this.size) : '',
      this.color ? `text-${this.color}` : '',
      this.width || this.height ? 'leo-icon--custom-size' : '',
      isColorIcon(this.type) ? 'leo-icon--color-icon' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Host aria-label={this.type}>
        <span class={classes} innerHTML={this.generateSvgHtml()} />
      </Host>
    );
  }
}
