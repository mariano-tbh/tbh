export type Context<T> = (value: T) => (action: () => void) => void;

const CTX_VALUE = Symbol();

export function context<T>(initialValue?: T): Context<T> {
  let current: T | undefined = initialValue;

  function provider(value: T) {
    const prev = current;
    return function run(action: () => void) {
      current = value;
      action();
      current = prev;
    };
  }

  Object.defineProperty(provider, CTX_VALUE, {
    enumerable: true,
    configurable: false,
    get() {
      return current;
    },
  });

  return provider;
}

export function use<T, S extends boolean>(
  ctx: Context<T>,
  { strict = false as S }: { strict?: S } = {},
): S extends true ? T : T | undefined {
  if (!(CTX_VALUE in ctx)) {
    throw new Error(`${ctx.name} is not a valid context`);
  }

  const value = ctx[CTX_VALUE] as T | undefined;

  if (strict && typeof value === "undefined") {
    throw new Error("using context outside provider");
  }

  return value as T;
}
