import { effect } from './effect.js';
import { store } from './store.js';

export type AsyncStatus = 'pending' | 'fulfilled' | 'rejected';

export type PendingState<T, I> = {
  status: 'pending';
  value: I | T;
  error: undefined;
};

export type FulfilledState<T> = {
  status: 'fulfilled';
  value: T;
  error: undefined;
};

export type RejectedState<I, E> = {
  status: 'rejected';
  value: I;
  error: E;
};

export type AsyncState<T, E = unknown, I extends T | undefined = undefined> =
  | PendingState<T, I>
  | FulfilledState<T>
  | RejectedState<I, E>;

export type Loader<T> = ({ signal }: { signal: AbortSignal }) => Promise<T>;

export type AsyncConfig<T, I extends T | undefined> = {
  loader: Loader<T>;
  initialValue?: I;
};

export function async<T, E = unknown>(loader: Loader<T>): AsyncState<T, E>;
export function async<T, E = unknown, I extends T | undefined = undefined>(
  config: AsyncConfig<T, I>
): AsyncState<T, E, I>;
export function async<T, E = unknown, I extends T | undefined = undefined>(
  config: Loader<T> | AsyncConfig<T, I>
) {
  if (typeof config === 'function') {
    config = { loader: config };
  }

  const { loader, initialValue } = config;

  const _state = store({
    status: 'pending',
    value: initialValue,
    error: undefined,
  } as AsyncState<T, E, I>);

  effect(async ({ signal }) => {
    _state.status = 'pending';
    try {
      _state.value = await loader({ signal });
      _state.status = 'fulfilled';
    } catch (error) {
      _state.error = error as E;
      _state.status = 'rejected';
    }
  });

  return _state;
}
