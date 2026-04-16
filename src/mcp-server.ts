import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TodoService } from "./todo-service.js";
import { CalculatorService } from "./calculator-service.js";
import { EarthworkService } from "./earthwork-service.js";

const todoService = new TodoService();
const calculator = new CalculatorService();
const earthwork = new EarthworkService();

/**
 * MCP Server Factory
 * Creates a new McpServer instance with all tools, prompts, and resources registered.
 */
export function createMcpServer() {
  const server = new McpServer({
    name: "mcp-multi-service-server",
    version: "1.0.0",
  });

  // --- TodoList Tools ---

  server.registerTool(
    "add_todo",
    {
      description: "Add a new todo item to the list",
      inputSchema: {
        text: z.string().describe("The content of the todo item"),
      },
    },
    async ({ text }) => {
      const todo = todoService.add(text);
      return {
        content: [{ type: "text", text: `Added todo: [${todo.id}] ${todo.text}` }],
      };
    }
  );

  server.registerTool(
    "list_todos",
    {
      description: "List all todo items",
    },
    async () => {
      const todos = todoService.list();
      if (todos.length === 0) {
        return { content: [{ type: "text", text: "No todos found." }] };
      }
      const text = todos
        .map((t) => `${t.completed ? "[x]" : "[ ]"} ${t.id}: ${t.text}`)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "update_todo",
    {
      description: "Update an existing todo item",
      inputSchema: {
        id: z.string().describe("The ID of the todo item"),
        text: z.string().optional().describe("New text for the todo"),
        completed: z.boolean().optional().describe("New completion status"),
      },
    },
    async ({ id, text, completed }) => {
      try {
        const todo = todoService.update(id, { text, completed });
        return {
          content: [{ type: "text", text: `Updated todo: [${todo.id}] ${todo.text} (${todo.completed ? "completed" : "pending"})` }],
        };
      } catch (e: any) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    }
  );

  server.registerTool(
    "delete_todo",
    {
      description: "Delete a todo item",
      inputSchema: {
        id: z.string().describe("The ID of the todo item to delete"),
      },
    },
    async ({ id }) => {
      try {
        todoService.delete(id);
        return {
          content: [{ type: "text", text: `Deleted todo: ${id}` }],
        };
      } catch (e: any) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    }
  );

  // --- Calculator Tools ---

  server.registerTool(
    "calculate",
    {
      description: "Perform basic arithmetic operations (add, subtract, multiply, divide)",
      inputSchema: {
        operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The arithmetic operation to perform"),
        a: z.number().describe("First operand"),
        b: z.number().describe("Second operand"),
      },
    },
    async ({ operation, a, b }) => {
      let result: number;
      try {
        switch (operation) {
          case "add": result = calculator.add(a, b); break;
          case "subtract": result = calculator.subtract(a, b); break;
          case "multiply": result = calculator.multiply(a, b); break;
          case "divide": result = calculator.divide(a, b); break;
          default: throw new Error("Invalid operation");
        }
        return {
          content: [{ type: "text", text: `Result: ${a} ${operation} ${b} = ${result}` }],
        };
      } catch (e: any) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    }
  );

  // --- Earthwork Tools (Remote Mock) ---

  server.registerTool(
    "calculate_earthwork_volumes",
    {
      description: "Calculate cut and fill volumes for a project (Remote Call)",
      inputSchema: {
        projectId: z.string().describe("The unique identifier of the project"),
      },
    },
    async ({ projectId }) => {
      const result = await earthwork.calculateVolumes(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "calculate_topsoil_area",
    {
      description: "Calculate the topsoil area for a project (Remote Call)",
      inputSchema: {
        projectId: z.string().describe("The unique identifier of the project"),
      },
    },
    async ({ projectId }) => {
      const result = await earthwork.calculateTopsoilArea(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "calculate_model_volume",
    {
      description: "Calculate the volume of a specific engineering model (Remote Call)",
      inputSchema: {
        modelId: z.string().describe("The unique identifier of the model"),
      },
    },
    async ({ modelId }) => {
      const result = await earthwork.calculateModelVolume(modelId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_soil_layers",
    {
      description: "Retrieve soil layer information for a specific location (Remote Call)",
      inputSchema: {
        locationId: z.string().describe("The identifier of the location"),
      },
    },
    async ({ locationId }) => {
      const result = await earthwork.getSoilLayers(locationId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "calculate_replacement",
    {
      description: "Calculate replacement volume for a given area and depth (Remote Call)",
      inputSchema: {
        area: z.number().describe("The area for replacement in m²"),
        depth: z.number().describe("The depth for replacement in m"),
      },
    },
    async ({ area, depth }) => {
      const result = await earthwork.calculateReplacement(area, depth);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "calculate_total_engineering",
    {
      description: "Calculate the total engineering volume and cost estimate (Remote Call)",
      inputSchema: {
        projectId: z.string().describe("The unique identifier of the project"),
      },
    },
    async ({ projectId }) => {
      const result = await earthwork.calculateTotalEngineering(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // --- Prompts ---

  server.registerPrompt(
    "analyze_todo_priority",
    {
      description: "Analyze the current todo list and suggest priorities",
    },
    async () => {
      const todos = todoService.list();
      const todoText = todos.map(t => `- ${t.text} (${t.completed ? 'Done' : 'Pending'})`).join('\n');
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please analyze the following todo list and suggest which items should be prioritized based on their content:\n\n${todoText || 'No todos found.'}`
            }
          }
        ]
      };
    }
  );

  server.registerPrompt(
    "engineering_report_summary",
    {
      description: "Generate a summary template for an engineering earthwork report",
      argsSchema: {
        projectId: z.string().describe("The project ID to include in the report"),
      },
    },
    async ({ projectId }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to write an engineering report for project ${projectId}. Please provide a structured summary template that includes sections for Cut/Fill volumes, Topsoil area, and Soil layer analysis.`
            }
          }
        ]
      };
    }
  );

  // --- Resources ---

  server.registerResource(
    "current_todos",
    "todos://current",
    { mimeType: "application/json" },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(todoService.list(), null, 2),
          },
        ],
      };
    }
  );

  return server;
}

// Default instance for backward compatibility or singleton use
export const server = createMcpServer();

/**
 * Run with Stdio if executed directly
 */
if (process.argv.includes("--stdio")) {
  const transport = new StdioServerTransport();
  server.connect(transport).catch(console.error);
  console.error("MCP Server running on stdio");
}
