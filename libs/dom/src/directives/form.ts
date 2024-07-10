import type { ZodError, ZodIssue, ZodSchema } from 'zod';
import { ofType } from '../utils/of-type.js';
import { directive } from './_directive.js';

const __fieldType = [
  HTMLInputElement,
  HTMLSelectElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
] as const;

export type FieldElement = (typeof __fieldType)[number]['prototype'];

export function isFieldElement(node: unknown): node is FieldElement {
  return __fieldType.some(($) => node instanceof $);
}

export type OnSubmit<T> = (value: T, event: SubmitEvent) => void;
export type OnError = (
  field: FieldElement,
  issue: ZodIssue,
  error: ZodError
) => void;

export const getParentForm = (field: FieldElement) => {
  let parentElement = field.parentElement;
  while (!(parentElement instanceof HTMLFormElement)) {
    if (parentElement === null) throw new Error('element is outside a form');
    parentElement = parentElement.parentElement;
  }
  return parentElement;
};

export const OnError: OnError = (field, issue) => {
  field.setCustomValidity(issue.message);
  field.reportValidity();

  field.addEventListener(
    'input',
    () => {
      field.setCustomValidity('');
      field.reportValidity();
    },
    { once: true }
  );
};

export const form = directive(
  <T>(config: {
    schema: ZodSchema<T>;
    onSubmit: OnSubmit<T>;
    onError?: OnError;
  }) => {
    const { schema, onSubmit, onError = OnError } = config;

    return ofType(HTMLFormElement)((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!(event.target instanceof HTMLFormElement)) return;

        const fields = toFields(event.target);

        const { success, data, error } = schema.safeParse(fields);

        if (success) return onSubmit(data, event);

        for (const issue of error.issues) {
          const { path } = issue;
          const name = path.join('.');
          const field = form.elements.namedItem(name);
          if (!isFieldElement(field)) continue;
          onError(field, issue, error);
        }
      });
    });
  }
);

const nameof = (field: FieldElement) => field.id || field.name;

const toFields = (form: HTMLFormElement) => {
  const formData = new FormData(form);

  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      formData.append(nameof(el), el.checked ? el.value : '');
    }
  }

  return Object.fromEntries(formData);
};
