declare module 'jest-axe' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function axe(element: Element | Document): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toHaveNoViolations: any;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
