import { describe, expect, test, vi } from "vitest";
import { State, state } from "./state.js";
import {
  destroy,
  publish,
  subscribe,
  subscribeImmediate,
  subscribeMany,
  subscribeOnce,
} from "./pubsub.js";

describe("pubsub", () => {
  test("subscribe to state", () => {
    const cb = vi.fn();
    const dep = state(0);

    const _ = subscribe(dep, (value, old) => {
      cb("count is " + value + " was " + old);
    });

    publish(dep, 1, 0);
    publish(dep, 2, 1);

    expect(cb).toHaveBeenNthCalledWith(1, "count is 1 was 0");
    expect(cb).toHaveBeenNthCalledWith(2, "count is 2 was 1");
  });

  test("unsubscribe should remove the callback from ", () => {
    const cb = vi.fn();
    const dep = state(0);

    const unsubWriteValue = subscribe(dep, (value, old) => {
      cb("count is " + value);
    });
    const unsubWriteOld = subscribe(dep, (value, old) => {
      cb("old was " + old);
    });

    publish(dep, 1, 0);
    unsubWriteValue();
    publish(dep, 2, 1);
    unsubWriteOld();
    publish(dep, 3, 2);

    expect(cb).toHaveBeenNthCalledWith(1, "count is 1");
    expect(cb).toHaveBeenNthCalledWith(2, "old was 0");
    expect(cb).not.toHaveBeenNthCalledWith(3, "count is 2");
    expect(cb).toHaveBeenNthCalledWith(3, "old was 1");
    expect(cb).not.toHaveBeenNthCalledWith(4, "count is 3");
    expect(cb).not.toHaveBeenNthCalledWith(4, "old was 2");
  });

  test("destroy should remove all subscripions to a dependency", () => {
    const cb = vi.fn();
    const dep = state(0);

    subscribe(dep, (value, old) => {
      cb("count is " + value);
    });
    subscribe(dep, (value, old) => {
      cb("old was " + old);
    });

    publish(dep, 1, 0);
    destroy(dep);
    publish(dep, 2, 1);

    expect(cb).toHaveBeenNthCalledWith(1, "count is 1");
    expect(cb).toHaveBeenNthCalledWith(2, "old was 0");
    expect(cb).not.toHaveBeenNthCalledWith(3, "count is 2");
    expect(cb).not.toHaveBeenNthCalledWith(4, "old was 1");
  });

  test("subscribe to many should be triggered when any dep changes", () => {
    const cb = vi.fn();
    const dep1 = state(0);
    const dep2 = state(0);
    const dep3 = state(0);

    const unsubMany = subscribeMany([dep1, dep2, dep3], (trigger) => {
      cb(trigger);
    });

    publish(dep1, 1, undefined);
    publish(dep2, 2, undefined);
    publish(dep3, 3, undefined);
    unsubMany();
    publish(dep1, 1, undefined);
    publish(dep2, 2, undefined);
    publish(dep3, 3, undefined);

    expect(cb).toHaveBeenNthCalledWith(1, dep1);
    expect(cb).toHaveBeenNthCalledWith(2, dep2);
    expect(cb).toHaveBeenNthCalledWith(3, dep3);
    expect(cb).not.toHaveBeenNthCalledWith(4, dep1);
    expect(cb).not.toHaveBeenNthCalledWith(5, dep2);
    expect(cb).not.toHaveBeenNthCalledWith(6, dep3);
  });

  test("subscribeOnce should only trigger action once", () => {
    const cb = vi.fn();
    const dep = state<string>();

    const _ = subscribeOnce(dep, (value, old) => {
      cb("hello, " + value);
    });

    publish(dep, "frank", undefined);
    publish(dep, "jane", undefined);

    expect(cb).toHaveBeenNthCalledWith(1, "hello, frank");
    expect(cb).not.toHaveBeenNthCalledWith(2, "hello, jane");
  });

  test("subscribeImmediate should trigger after subscribing", () => {
    const cb = vi.fn();
    const dep = state(0);

    const _ = subscribeImmediate(dep, (value, old = 0) => {
      cb("count is " + value + ", was " + old);
    });

    publish(dep, 1, 0);
    publish(dep, 2, 1);

    expect(cb).toHaveBeenNthCalledWith(1, 'count is 0, was 0');
    expect(cb).toHaveBeenNthCalledWith(2, 'count is 1, was 0');
    expect(cb).toHaveBeenNthCalledWith(3, 'count is 2, was 1');
  });
});
