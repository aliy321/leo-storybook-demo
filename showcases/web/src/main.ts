import { defineCustomElement as defineLeoButton } from '@leo/web/button';
import './globals.css';

defineLeoButton();

const app = document.querySelector<HTMLDivElement>('#root');

if (!app) {
  throw new Error('Unable to mount consumer web example: #root was not found.');
}

app.innerHTML = `
  <main class="min-h-screen bg-background p-6 text-foreground">
    <div class="mx-auto flex max-w-xl flex-col gap-4">
      <h1 class="text-2xl font-semibold">Web component showcase</h1>
      <p class="text-muted-foreground">Consumer-owned Tailwind config and semantic globals.</p>
      <leo-button label="Click Me" variant="default" size="default"></leo-button>
    </div>
  </main>
`;
