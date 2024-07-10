import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { state } from "./state.js";
import { effect } from "./effect.js";

describe("effect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should trigger action when declared", () => {
    const cb = vi.fn();

    effect(() => {
      cb(`hello, world!`);
    });

    expect(cb).toHaveBeenCalledWith("hello, world!");
  });

  test("should trigger action when deps change", () => {
    const cb = vi.fn();

    const count = state(0);

    effect(() => {
      cb(`the count is: ${count.value}`);
    });

    count.value++;
    count.value++;

    expect(cb).toHaveBeenNthCalledWith(1, "the count is: 0");
    expect(cb).toHaveBeenNthCalledWith(2, "the count is: 1");
    expect(cb).toHaveBeenNthCalledWith(3, "the count is: 2");
  });

  test("should not trigger action after being destroyed", () => {
    const cb = vi.fn();

    const count = state(0);

    const e = effect(() => {
      cb(`the count is: ${count.value}`);
    });

    e.destroy();

    count.value++;
    count.value++;

    expect(cb).toHaveBeenNthCalledWith(1, "the count is: 0");
    expect(cb).not.toHaveBeenNthCalledWith(2, "the count is: 1");
    expect(cb).not.toHaveBeenNthCalledWith(3, "the count is: 2");
  });

  test("making use of abort signal", async () => {
    const cb = vi.fn();

    const count = state(0);

    effect(({ signal }) => {
      setTimeout(() => {
        if (!signal.aborted) {
          cb(`the count is: ${count.value}`);
        }
      });
    });

    count.value++;
    count.value++;

    await vi.runAllTimersAsync();
    expect(cb).not.toHaveBeenCalledWith("the count is: 0");
    expect(cb).not.toHaveBeenCalledWith("the count is: 1");
    expect(cb).toHaveBeenCalledWith("the count is: 2");
  });
});
