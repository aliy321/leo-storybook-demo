declare module '@leo/web/loader' {
  export function defineCustomElements(win?: Window): Promise<void>;
}

declare module '*.mdx' {
  const MDXComponent: unknown;
  export default MDXComponent;
}
