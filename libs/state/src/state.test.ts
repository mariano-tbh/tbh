import { describe, expect, test } from "vitest";
import { State, isState, state } from "./state.js";

describe("state", () => {
  test("state with default value", () => {
    const count = state(0);

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
  });

  test("state without initializer", () => {
    const name = state<string>();

    expect(name.value).toBeUndefined();
    name.value = "bob";
    expect(name.value).toEqual("bob");
  });

  test("isState is true when using state function only", () => {
    const valid = state(0);
    const invalid: State<number> = { value: 0 };

    expect(isState(valid)).toBeTruthy();
    expect(isState(invalid)).toBeFalsy();
  });
});
