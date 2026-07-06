import { Component, Host, h } from '@stencil/core';
import { alertTitleWebClassName } from '@leo/ui/alert';

@Component({ tag: 'leo-alert-title', styleUrl: 'alert-title.web.css', shadow: true })
export class LeoAlertTitle {
  render() {
    return (
      <Host>
        <div class={alertTitleWebClassName()} data-slot="alert-title">
          <slot />
        </div>
      </Host>
    );
  }
}
