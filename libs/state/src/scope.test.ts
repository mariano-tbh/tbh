import { describe, expect, test } from "vitest";
import { state } from "./state.js";
import { scope } from "./scope.js";

describe("scope", () => {
  test("should collect all deps that are registed inside action call", () => {
    const depA = state(0);
    const depB = state(0);
    const depC = state(0);

    const action = () => {
      depC.value = depA.value + depB.value;
    };

    const deps = scope(action);

    expect(deps).toContain(depA);
    expect(deps).toContain(depB);
    expect(deps).not.toContain(depC);
  });

  test("should not mix deps in nested scopes", () => {
    const depA = state(0);
    const depB = state(0);
    const depC = state(0);

    const deps1 = scope(() => {
      depA.value = depB.value + depC.value;

      const deps2 = scope(() => {
        depB.value = depA.value + depC.value;

        const deps3 = scope(() => {
          depC.value = depA.value + depB.value;
        });

        expect(deps3.has(depA)).toBeTruthy();
        expect(deps3.has(depB)).toBeTruthy();
        expect(deps3.has(depC)).toBeFalsy();
      });

      expect(deps2.has(depA)).toBeTruthy();
      expect(deps2.has(depB)).toBeFalsy();
      expect(deps2.has(depC)).toBeTruthy();
    });

    expect(deps1.has(depA)).toBeFalsy();
    expect(deps1.has(depB)).toBeTruthy();
    expect(deps1.has(depC)).toBeTruthy();
  });
});
