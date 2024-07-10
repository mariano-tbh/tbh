import { directive } from "./_directive.js";

export const on = directive((event: string, listener: EventListener) => {
  return (node) => {
    node.addEventListener(event, listener);
  };
});
