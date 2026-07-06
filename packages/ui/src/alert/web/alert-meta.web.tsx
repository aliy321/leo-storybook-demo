import { Component, Host, h } from '@stencil/core';
import { alertMetaWebClassName } from '@leo/ui/alert';

@Component({ tag: 'leo-alert-meta', styleUrl: 'alert-meta.web.css', shadow: true })
export class LeoAlertMeta {
  render() {
    return (
      <Host>
        <div class={alertMetaWebClassName()} data-slot="alert-meta">
          <slot />
        </div>
      </Host>
    );
  }
}
