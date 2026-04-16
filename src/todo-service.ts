/**
 * TodoList Item Type
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

/**
 * TodoList Service
 */
export class TodoService {
  private todos: Todo[] = [];

  add(text: string): Todo {
    const todo: Todo = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.todos.push(todo);
    return todo;
  }

  list(): Todo[] {
    return this.todos;
  }

  update(id: string, updates: Partial<Pick<Todo, "text" | "completed">>): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new Error(`Todo with id ${id} not found`);
    Object.assign(todo, updates);
    return todo;
  }

  delete(id: string): void {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Todo with id ${id} not found`);
    this.todos.splice(index, 1);
  }

  clear(): void {
    this.todos = [];
  }
}
