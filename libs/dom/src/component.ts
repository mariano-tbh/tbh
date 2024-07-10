import { effect } from '@tbh/state';
import { context } from '@tbh/ioc';
import { observe, onRemoveNode } from './observer.js';
import { Directive } from './directives/_directive.js';

export type ComponentFactory<P extends {}> = (props: P) => ComponentDefinition;

export type ComponentDefinition = {
  provide?: ReturnType<ReturnType<typeof context<unknown>>>[];
  bind?: (root: HTMLElement) => void;
  render(): string;
};

export type Component = Directive<HTMLElement>;

export function component<P extends {}>(factory: ComponentFactory<P>) {
  return (props: P): Directive<HTMLElement> => {
    return (root) => {
      const _component = factory(props);

      effect(({ signal: _ }) => {
        const { render, bind, provide = [] } = _component;

        root.innerHTML = render();

        const mount = provide.reduce<() => void>(
          (prev, next) => () => next(prev),
          () => bind?.(root)
        );

        mount();
      });

      const def = Object.seal({
        destroy() {
          // for (const dep of deps) {
          //   destroy(dep);
          // }
        },
      });

      observe(root);

      onRemoveNode(root, () => {
        def.destroy();
      });
    };
  };
}
