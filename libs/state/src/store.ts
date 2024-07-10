import { State, state } from "./state.js";

export function store<T extends object>(src: T): T {
  const deps = new Map<keyof T, State>();

  function $state(target: T, p: string | symbol, receiver: unknown) {
    let $ = deps.get(p as keyof T);

    if (typeof $ === "undefined") {
      $ = state(Reflect.get(target, p, receiver));
      deps.set(p as keyof T, $);
    }

    return $;
  }

  return new Proxy(src, {
    get(target, p, receiver) {
      return $state(target, p, receiver).value;
    },
    set(target, p, newValue, receiver) {
      $state(target, p, receiver).value = newValue;
      return true;
    },
  });
}
