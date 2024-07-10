import { subscribe, type State } from '@tbh/state';
import { ofType } from '../utils/of-type.js';
import { directive } from './_directive.js';

export const checked = directive(
  <T>(
    state: State<T>,
    config: {
      event?: 'change' | 'blur' | 'input';
      toState?(value: boolean): T;
      toValue?(value: T): boolean;
    } = {}
  ) => {
    const {
      event = 'change',
      toState = (value) => value as T,
      toValue = (value) => Boolean(value),
    } = config;

    return ofType(HTMLInputElement)((checkbox) => {
      if (checkbox.type !== 'checkbox') {
        throw new Error('this directive should only be applied on checkboxes');
      }

      checkbox.addEventListener(event, ({ currentTarget }) => {
        if (currentTarget instanceof HTMLInputElement) {
          state.value = toState(currentTarget.checked);
        }
      });

      subscribe(state, (value) => {
        checkbox.checked = toValue(value);
      });
    });
  }
);
