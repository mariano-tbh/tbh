import type { Directive } from "../directives/_directive.js";

export function ofType<E extends Element>(t: new (...args: unknown[]) => E) {
  return (directive: Directive<E>): Directive<E> => {
    return (node: Node) => {
      if (node instanceof t) {
        return directive(node);
      }

      throw new Error(
        `${node.constructor.name} is not a valid instance of ${t.name}`,
      );
    };
  };
}
