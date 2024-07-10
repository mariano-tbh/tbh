import { context, use } from '@tbh/ioc';
import type { State } from './state.js';

export type Action = () => void;

const CurrentScope = context<Set<State>>();

export function scope(action: Action) {
  const deps = new Set<State>();
  CurrentScope(deps)(() => action());
  return deps;
}

scope.register = function (state: State) {
  const deps = use(CurrentScope);
  if (typeof deps === 'undefined') return;
  deps.add(state);
};
