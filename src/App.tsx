import React, { useState, useEffect } from "react";
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Terminal, 
  Server as ServerIcon, 
  Wrench, 
  Database,
  Send,
  RefreshCw,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * MCP Test Client UI
 */
export default function App() {
  const [todos, setTodos] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawRequest, setRawRequest] = useState(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }, null, 2));
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"todos" | "tools" | "console">("todos");

  // Fetch initial data
  useEffect(() => {
    fetchTools();
    fetchTodos();
  }, []);

  const mcpRequest = async (method: string, params: any = {}) => {
    try {
      const response = await fetch("/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          params
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("MCP Request failed:", error);
      return { error: { message: "Network error" } };
    }
  };

  const fetchTools = async () => {
    const data = await mcpRequest("tools/list");
    if (data.result?.tools) setTools(data.result.tools);
  };

  const fetchTodos = async () => {
    const data = await mcpRequest("resources/read", { uri: "todos://current" });
    if (data.result?.contents?.[0]?.text) {
      setTodos(JSON.parse(data.result.contents[0].text));
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setLoading(true);
    await mcpRequest("tools/call", { name: "add_todo", arguments: { text: newTodo } });
    setNewTodo("");
    await fetchTodos();
    setLoading(false);
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await mcpRequest("tools/call", { name: "update_todo", arguments: { id, completed: !completed } });
    await fetchTodos();
  };

  const handleDeleteTodo = async (id: string) => {
    await mcpRequest("tools/call", { name: "delete_todo", arguments: { id } });
    await fetchTodos();
  };

  const handleSendRaw = async () => {
    setLoading(true);
    try {
      const response = await fetch("/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: rawRequest
      });
      const data = await response.json();
      setRawResponse(data);
    } catch (error: any) {
      setRawResponse({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-accent selection:text-white">
      {/* Header */}
      <header className="bg-surface border-b border-border px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <ServerIcon className="w-6 h-6 text-accent" />
            TodoList MCP Server
          </h1>
          <span className="bg-[#E0E7FF] text-[#3730A3] text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            v2025-03-26
          </span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded-md text-xs font-medium">
            <span className="w-2 h-2 bg-[#10B981] rounded-full" />
            Stdio Transport
          </div>
          <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded-md text-xs font-medium">
            <span className="w-2 h-2 bg-[#10B981] rounded-full" />
            Streamable HTTP
          </div>
          <button 
            onClick={() => { fetchTools(); fetchTodos(); }}
            className="p-2 text-text-muted hover:text-text-main transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[calc(100vh-89px)]">
        {/* Left Column: Sidebar (Info) */}
        <aside className="bg-surface border-r border-border p-10 flex flex-col gap-8">
          <section>
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Key Features
            </h2>
            <ul className="space-y-4">
              <li className="border-b border-border pb-3">
                <span className="block font-semibold text-[13px]">Hybrid Transport</span>
                <span className="text-xs text-text-muted">Unified binary for CLI and remote server deployments.</span>
              </li>
              <li className="border-b border-border pb-3">
                <span className="block font-semibold text-[13px]">Single Endpoint</span>
                <span className="text-xs text-text-muted">Uses standard POST /mcp for all JSON-RPC signals.</span>
              </li>
              <li className="border-b border-border pb-3">
                <span className="block font-semibold text-[13px]">CORS & Load Balancing</span>
                <span className="text-xs text-text-muted">Seamless integration with API gateways and proxies.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Resources
            </h2>
            <div className="p-4 bg-bg rounded-lg border border-border">
              <p className="font-mono text-xs font-bold text-accent">todos://current</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                The full list of todos in JSON format.
              </p>
            </div>
          </section>

          <div className="mt-auto pt-8 border-t border-border opacity-50 text-[10px] font-mono uppercase leading-relaxed">
            <p>MCP Specification 2025-03-26</p>
            <p>Node.js TypeScript Implementation</p>
            <p>© 2026 Model Context Protocol</p>
          </div>
        </aside>

        {/* Right Column: Content */}
        <div className="p-10 flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-[#F3F4F6] rounded-lg self-start">
            {[
              { id: "todos", label: "Todo List", icon: ListTodo },
              { id: "tools", label: "MCP Tools", icon: Wrench },
              { id: "console", label: "Raw Console", icon: Terminal },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === tab.id 
                    ? "bg-surface text-accent shadow-sm" 
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "todos" && (
                <motion.div
                  key="todos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl"
                >
                  <form onSubmit={handleAddTodo} className="flex gap-3 mb-8">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new task via MCP tool..."
                      className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-accent text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </form>

                  <div className="space-y-3">
                    {todos.length === 0 ? (
                      <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center text-text-muted italic">
                        No tasks found in the MCP resource.
                      </div>
                    ) : (
                      todos.map((todo) => (
                        <div 
                          key={todo.id}
                          className="group bg-surface border border-border rounded-xl p-4 flex items-center justify-between hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <button onClick={() => handleToggleTodo(todo.id, todo.completed)}>
                              {todo.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-border group-hover:text-accent transition-colors" />
                              )}
                            </button>
                            <div>
                              <p className={`font-medium ${todo.completed ? 'line-through text-text-muted' : 'text-text-main'}`}>
                                {todo.text}
                              </p>
                              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">ID: {todo.id}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "tools" && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {tools.map((tool) => (
                    <div key={tool.name} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench className="w-4 h-4 text-accent" />
                        <h3 className="font-bold text-sm uppercase tracking-tight">{tool.name}</h3>
                      </div>
                      <p className="text-sm text-text-muted mb-4 leading-relaxed">{tool.description}</p>
                      <div className="bg-bg p-4 rounded-lg text-[11px] font-mono text-text-muted overflow-auto max-h-40 border border-border">
                        <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "console" && (
                <motion.div
                  key="console"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col gap-6"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Request (JSON-RPC)</label>
                        <span className="text-[10px] text-text-muted opacity-50">INPUT</span>
                      </div>
                      <textarea
                        value={rawRequest}
                        onChange={(e) => setRawRequest(e.target.value)}
                        className="flex-1 bg-code-bg text-code-text p-6 rounded-xl font-mono text-xs focus:outline-none resize-none shadow-lg"
                      />
                      <button
                        onClick={handleSendRaw}
                        disabled={loading}
                        className="mt-4 bg-accent text-white py-3 rounded-lg font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                      >
                        <Send className="w-4 h-4" />
                        Execute Request
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Response</label>
                        <span className="text-[10px] text-text-muted opacity-50">OUTPUT</span>
                      </div>
                      <div className="flex-1 bg-code-bg text-code-text p-6 rounded-xl font-mono text-xs overflow-auto shadow-lg border border-white/5">
                        {rawResponse ? (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(rawResponse, null, 2)}</pre>
                        ) : (
                          <p className="text-white/20 italic">Waiting for request...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
