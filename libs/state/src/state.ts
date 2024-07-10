import { publish } from './pubsub.js';
import { scope } from './scope.js';

const $$STATE = Symbol();

export type State<T = unknown> = {
  value: T;
};

export function state<T>(initialState: T): State<T>;
export function state<T>(factory: () => T): State<T>;
export function state<T>(): State<T | undefined>;
export function state<T>(start?: T) {
  let value: T;

  const self = Object.seal({
    [$$STATE]: true,
    get value(): T {
      scope.register(self);

      if (typeof value === 'undefined') {
        if (typeof start === 'function') {
          value = start();
        } else if (typeof start !== 'undefined') {
          value = start;
        }
      }

      return value;
    },
    set value(next: T) {
      const old = value;
      value = next;
      publish(this, value, old);
    },
  }) as State<T>;

  return self;
}

export function isState(it: unknown): it is State {
  return (
    typeof it === 'object' &&
    it !== null &&
    $$STATE in it &&
    it[$$STATE] === true
  );
}

export function extend<S, P extends Record<PropertyKey, unknown>>(
  state: State<S>,
  props: P
): State<S> & P;
export function extend<S, P extends PropertyKey, V>(
  state: State<S>,
  propertyKey: P,
  value: V
): State<S> & {
  [K in P]: V;
};
export function extend<S, P extends PropertyKey, V>(
  ...args:
    | [state: State<S>, props: Record<P, V>]
    | [state: State<S>, propertyKey: P, value: V]
) {
  const [state, prop, value] = args;

  if (typeof prop === 'object') {
    return Object.assign({}, state, prop);
  } else {
    return Object.assign({}, state, { [prop]: value });
  }
}
