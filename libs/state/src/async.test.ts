import { describe, expect, test } from "vitest";
import { async } from "./async.js";
import { waitFor } from "@testing-library/dom";
import { state } from "./state.js";

describe("async", () => {
  type Todo = {
    id: number;
    done: boolean;
  };

  const todos: Todo[] = [
    { id: 1, done: true },
    { id: 2, done: false },
    { id: 3, done: true },
  ];

  async function getTodos({ signal }: { signal: AbortSignal }) {
    await sleep(500);
    signal.throwIfAborted();
    return todos;
  }

  async function getTodoById(id: number, { signal }: { signal: AbortSignal }) {
    await sleep(500);
    signal.throwIfAborted();
    return todos.find((todo) => todo.id === id) ?? null;
  }

  test("async state", async () => {
    const state = async({
      loader: getTodos,
    });

    expect(state.value).toBeUndefined();
    expect(state.status).toEqual("pending");

    await waitFor(() => {
      expect(state.value).toBeDefined();
      expect(state.status).toEqual("fulfilled");
    });
  });

  test("async state", async () => {
    const todoId = state(1);
    const todos = async({
      loader: ({ signal }) => getTodoById(todoId.value, { signal }),
    });

    expect(todos.value).toBeUndefined();
    expect(todos.status).toEqual("pending");

    await waitFor(() => {
      expect(todos.value).toEqual({ id: 1, done: true });
      expect(todos.status).toEqual("fulfilled");
    });

    todoId.value = 2;

    expect(todos.status).toEqual("pending");

    await waitFor(() => {
      expect(todos.value).toEqual({ id: 2, done: false });
      expect(todos.status).toEqual("fulfilled");
    });
  });
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
