import { subscribeMany } from './pubsub.js';
import { scope } from './scope.js';
import { State, state } from './state.js';

export type DerivedState<T> = Readonly<State<T>>;

const __uninit = Symbol();

export function derived<T>(fn: () => T): DerivedState<T> {
  const _state = state<T>(() => {
    let value: T | typeof __uninit = __uninit;

    const deps = scope(() => {
      value = fn();
    });

    subscribeMany(deps, () => {
      _state.value = fn();
    });

    if (value === __uninit) throw new Error('lifecycle error');

    return value as T;
  });

  return _state;
}
