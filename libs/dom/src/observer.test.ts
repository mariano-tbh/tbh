import { beforeEach, describe, expect, test, vi } from "vitest";
import { observe, onRemoveNode } from "./observer.js";
import { waitFor } from "@testing-library/dom";

describe("observer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
  });

  test("watch nodes", async () => {
    const cb = vi.fn();
    const id = "test_element";
    const child = document.createElement("div");
    child.id = id;

    observe(container);
    onRemoveNode(child, cb);
    container.appendChild(child);
    container.innerHTML = "";

    expect(cb).toHaveBeenCalledWith(child);
  });
});
