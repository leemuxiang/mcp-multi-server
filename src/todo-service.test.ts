import { describe, it, expect, beforeEach } from "vitest";
import { TodoService } from "./todo-service";

describe("TodoService", () => {
  let service: TodoService;

  beforeEach(() => {
    service = new TodoService();
  });

  it("should add a todo", () => {
    const todo = service.add("Test todo");
    expect(todo.text).toBe("Test todo");
    expect(todo.completed).toBe(false);
    expect(service.list()).toHaveLength(1);
  });

  it("should list todos", () => {
    service.add("Todo 1");
    service.add("Todo 2");
    expect(service.list()).toHaveLength(2);
  });

  it("should update a todo", () => {
    const todo = service.add("Original");
    const updated = service.update(todo.id, { text: "Updated", completed: true });
    expect(updated.text).toBe("Updated");
    expect(updated.completed).toBe(true);
  });

  it("should delete a todo", () => {
    const todo = service.add("To be deleted");
    service.delete(todo.id);
    expect(service.list()).toHaveLength(0);
  });

  it("should throw error when updating non-existent todo", () => {
    expect(() => service.update("invalid", { text: "fail" })).toThrow();
  });

  it("should throw error when deleting non-existent todo", () => {
    expect(() => service.delete("invalid")).toThrow();
  });
});
