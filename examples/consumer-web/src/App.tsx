import { Button } from '@leo/button';

export function App() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>@leo/button — web consumer proof</h1>
      <Button label="Click Me" type="filled" color="primary" size="md" />
    </main>
  );
}
