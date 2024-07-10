import { Destroyable, subscribeMany } from './pubsub.js';
import { scope } from './scope.js';

export type EffectFn = ({ signal }: { signal: AbortSignal }) => void;

export function effect(fn: EffectFn): Destroyable {
  let controller = new AbortController();
  const deps = scope(() => fn({ signal: controller.signal }));

  function act() {
    controller.abort();
    controller = new AbortController();
    fn({ signal: controller.signal });
  }

  const unsub = subscribeMany(deps, () => act());

  return Object.seal({
    destroy() {
      controller.abort();
      unsub();
    },
  });
}
