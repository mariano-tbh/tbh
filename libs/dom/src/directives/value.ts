import { subscribe, type State } from '@tbh/state';
import { ofType } from '../utils/of-type.js';
import { directive } from './_directive.js';

export const value = directive(
  <T>(
    state: State<T>,
    config: {
      event?: 'change' | 'blur' | 'input';
      toState?(value: string): T;
      toValue?(value: T): string;
    } = {}
  ) => {
    const {
      event = 'change',
      toState = (value) => value as T,
      toValue = (value) => String(value),
    } = config;

    return ofType(HTMLInputElement)((input) => {
      input.addEventListener(event, ({ currentTarget }) => {
        if (currentTarget instanceof HTMLInputElement) {
          state.value = toState(currentTarget.value);
        }
      });

      subscribe(state, (value) => {
        input.value = toValue(value);
      });
    });
  }
);
