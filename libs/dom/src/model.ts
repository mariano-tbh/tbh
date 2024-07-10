import { ParseSelector } from "typed-query-selector/parser.js";
import { Directive } from "./directives/_directive.js";

type DirectiveObject<Selector extends string> = {
  select?: "all" | "single";
  directive: (
    el: ParseSelector<Selector>,
  ) => Directive<ParseSelector<Selector>> | void;
};

type DirectiveGetter<Selector extends string> =
  | ((el: ParseSelector<Selector>) => Directive<ParseSelector<Selector>> | void)
  | DirectiveObject<Selector>;

export function model<
  Model extends {
    [K in keyof Model & string]: DirectiveGetter<K>;
  },
>(model: Model): Directive<HTMLElement> {
  return (root) => {
    for (const selector of Object.keys(model)) {
      let directive = model[selector as keyof Model] as DirectiveGetter<string>;
      if (typeof directive === "function") {
        directive = { directive };
      }

      const { select = "single", directive: apply } =
        directive as DirectiveObject<string>;

      if (select === "single") {
        const el = root.querySelector(selector);
        if (el === null) continue;
        apply(el)?.(el);
      } else {
        for (const el of root.querySelectorAll(selector)) {
          apply(el)?.(el);
        }
      }
    }
  };
}
