# MCP TodoList Server 架构文档

## 1. 系统架构图
系统采用分层架构设计，确保传输层与业务逻辑层解耦。

```
[ MCP 客户端 ] <------> [ 传输层 (Transport) ] <------> [ MCP 核心服务 (Server) ]
                            |                               |
                    +-------+-------+               +-------+-------+
                    |               |               |               |
              [ Stdio ]       [ HTTP ]        [ 业务逻辑 ]    [ 内存存储 ]
```

## 2. 核心组件

### 2.1 传输层 (Transport Layer)
- **StdioTransport**: 用于本地进程间通信。通过标准输入/输出流交换 JSON-RPC 消息。
- **StreamableHTTP**: 遵循 2025-03-26 规范。使用单端点 `/mcp` 处理 POST 请求。服务端根据请求类型返回即时 JSON 响应或维持 SSE 流。

### 2.2 业务逻辑层 (Service Layer)
- **TodoService**: 内存存储类，负责任务的增删改查。
- **CalculatorService**: 纯逻辑类，处理数学运算。
- **EarthworkService**: 远程调用类，通过异步 Mock 模拟与外部工程系统的 HTTP 交互。
- **McpServer**: 使用 MCP SDK 1.x 的 `McpServer` 实例化，采用流式 API 注册工具、资源和提示词。

### 2.3 表现层 (Presentation Layer)
- **React App**: 提供可视化管理界面。
- **Express Middleware**: 支持多会话 SSE 管理，每个客户端连接拥有独立的 Session。

## 3. 数据流向
1. **请求捕获**: Express 接收到 `/mcp` 的 POST 请求。
2. **协议解析**: 消息被传递给 `mcpServer.handleRequest`。
3. **逻辑执行**: 根据 JSON-RPC 的 `method` 调用对应的 Tool 或 Resource 处理函数。
4. **状态变更**: `TodoStore` 更新内存中的数据。
5. **响应返回**: 结果被封装回 JSON-RPC 响应格式并返回给客户端。

## 4. 安全设计
- **CORS**: 允许跨域请求，方便 Web 客户端集成。
- **错误处理**: 统一的 `McpError` 处理机制，确保异常信息符合规范且不泄露敏感系统信息。
