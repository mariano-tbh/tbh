import { describe, expect, test } from "vitest";
import { context, use } from "./context.js";

describe("context", () => {
  test("simple case", () => {
    const myContext = context<string>();

    const expected = "hello world";

    myContext(expected)(() => {
      const value = use(myContext);
      expect(value).toEqual(expected);
    });
  });

  test("nested contexts", () => {
    const myContext = context<string>();

    myContext("foo")(() => {
      const value = use(myContext);
      expect(value).toEqual("foo");

      myContext("bar")(() => {
        const value = use(myContext);
        expect(value).toEqual("bar");

        myContext("baz")(() => {
          const value = use(myContext);
          expect(value).toEqual("baz");
        });

        const value2 = use(myContext);
        expect(value2).toEqual("bar");
      });

      const value2 = use(myContext);
      expect(value2).toEqual("foo");
    });
  });
});
