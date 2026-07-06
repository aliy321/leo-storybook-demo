import { Component, Host, h } from '@stencil/core';
import { alertDescriptionWebClassName } from '@leo/ui/alert';

@Component({ tag: 'leo-alert-description', styleUrl: 'alert-description.web.css', shadow: true })
export class LeoAlertDescription {
  render() {
    return (
      <Host>
        <div class={alertDescriptionWebClassName()} data-slot="alert-description">
          <slot />
        </div>
      </Host>
    );
  }
}
