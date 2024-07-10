export type Directive<E extends Element = Element> = (element: E) => void;

export function directive<Args extends unknown[], E extends Element = Element>(
  factory: (...args: Args) => Directive<E>,
) {
  return factory;
}
