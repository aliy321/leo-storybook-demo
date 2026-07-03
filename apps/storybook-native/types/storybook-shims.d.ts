declare module 'storybook/test' {
  export function fn<T extends (...args: never[]) => unknown>(implementation?: T): T;
}

declare module 'storybook/actions' {
  export function action(name: string): (...args: unknown[]) => void;
}
