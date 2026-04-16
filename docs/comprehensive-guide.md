# MCP Multi-Service Server 综合项目文档

## 目录 (TOC)

- [1. 项目概述](#1-项目概述)
- [2. 设计目标](#2-设计目标)
- [3. 系统架构](#3-系统架构)
    - [3.1 架构图](#31-架构图)
    - [3.2 核心组件](#32-核心组件)
    - [3.3 数据流向](#33-数据流向)
- [4. 功能模块与工具 (Tools)](#4-功能模块与工具-tools)
    - [4.1 待办事项 (TodoList)](#41-待办事项-todolist)
    - [4.2 计算器 (Calculator)](#42-计算器-calculator)
    - [4.3 地质工程 (Earthwork)](#43-地质工程-earthwork)
    - [4.4 提示词模板 (Prompts)](#44-提示词模板-prompts)
    - [4.5 资源 (Resources)](#45-资源-resources)
- [5. 开发指南](#5-开发指南)
    - [5.1 环境要求](#51-环境要求)
    - [5.2 快速开始](#52-快速开始)
    - [5.3 核心文件说明](#53-核心文件说明)
- [6. 测试指南](#6-测试指南)
    - [6.1 单元测试](#61-单元测试)
    - [6.2 协议集成测试](#62-协议集成测试)
- [7. 编译与部署](#7-编译与部署)
    - [7.1 三种编译目标](#71-三种编译目标)
    - [7.2 Nginx 部署示例](#72-nginx-部署示例)
    - [7.3 Docker 部署建议](#73-docker-部署建议)
- [8. 客户端配置](#8-客户端配置)
    - [8.1 Claude Desktop 配置](#81-claude-desktop-配置)
    - [8.2 Cursor 配置](#82-cursor-配置)
- [9. 发布与 CI/CD](#9-发布与-cicd)
    - [9.1 私有仓库配置](#91-私有仓库配置)
    - [9.2 发布脚本](#92-发布脚本)
- [10. 大模型技能描述 (SKILL)](#10-大模型技能描述-skill)

---

## 1. 项目概述
本项目是一个基于 **Model Context Protocol (MCP)** 规范实现的综合性服务端示例。它不仅展示了如何管理待办事项（TodoList），还集成了数学计算（Calculator）和模拟远程调用的地质工程（Earthwork）业务。

项目支持多种传输协议：
- **Stdio**: 用于本地 IDE 插件（如 Claude Desktop）。
- **Streamable HTTP (2025-03-26)**: 最新的高性能单端点传输规范。
- **SSE (Server-Sent Events)**: 兼容主流 MCP 客户端的持久连接模式。

## 2. 设计目标
- **多传输协议支持**：同一套业务逻辑同时适配本地 Stdio 和远程 HTTP/SSE 部署。
- **符合最新规范**：采用 MCP SDK 1.x 版本的 `McpServer` 类，支持流式 API。
- **多业务集成**：涵盖内存存储、纯逻辑计算及异步 Mock 远程调用三种典型场景。
- **洁净极简主义**：前端界面突出信息层级，提供流畅的交互体验。

## 3. 系统架构

### 3.1 架构图
系统采用分层架构，确保传输层与业务逻辑层完全解耦。

```
[ MCP 客户端 ] <------> [ 传输层 (Transport) ] <------> [ MCP 核心服务 (Server) ]
                            |                               |
                    +-------+-------+               +-------+-------+
                    |               |               |               |
              [ Stdio ]       [ HTTP ]        [ 业务逻辑 ]    [ 存储/Mock ]
```

### 3.2 核心组件
- **传输层**: 包含 `StdioTransport`、`StreamableHTTP` 和 `SSEServerTransport`。
- **业务逻辑层**:
    - `TodoService`: 内存存储，管理任务状态。
    - `CalculatorService`: 处理算术运算。
    - `EarthworkService`: 模拟远程 HTTP 调用，处理工程量计算。
- **表现层**: 基于 React 的 Web 界面，用于可视化调试。

### 3.3 数据流向
1. 客户端发送请求（Stdio 或 HTTP POST）。
2. 传输层接收并解析 JSON-RPC 消息。
3. `McpServer` 根据 `method` 分发至对应的 Tool、Resource 或 Prompt 处理函数。
4. 处理函数调用 Service 层执行业务逻辑。
5. 结果封装为 JSON-RPC 响应并返回。

## 4. 功能模块与工具 (Tools)

### 4.1 待办事项 (TodoList)
- `add_todo`: 添加新任务。
- `list_todos`: 列出所有任务。
- `update_todo`: 更新任务内容或状态。
- `delete_todo`: 删除任务。

### 4.2 计算器 (Calculator)
- `calculate`: 执行加、减、乘、除运算。支持异常处理（如除零错误）。

### 4.3 地质工程 (Earthwork)
- `calculate_earthwork_volumes`: 计算挖填方量。
- `calculate_topsoil_area`: 计算表土面积。
- `calculate_model_volume`: 计算模型体积。
- `get_soil_layers`: 获取土层信息。
- `calculate_replacement`: 计算换填量。
- `calculate_total_engineering`: 计算总工程量及成本估算。

### 4.4 提示词模板 (Prompts)
- `analyze_todo_priority`: 分析任务列表并建议优先级。
- `engineering_report_summary`: 生成工程地质报告摘要模板。

### 4.5 资源 (Resources)
- `todos://current`: 实时获取当前任务列表的 JSON 视图。

## 5. 开发指南

### 5.1 环境要求
- Node.js 18.x+
- npm (建议 10.x+)

### 5.2 快速开始
1. 安装依赖：`npm install`
2. 启动开发环境：`npm run dev` (同时启动前端 UI 和 HTTP MCP 服务)
3. 访问：`http://localhost:3000`

### 5.3 核心文件说明
- `src/mcp-server.ts`: MCP 协议核心定义。
- `src/todo-service.ts`: 任务管理逻辑。
- `src/calculator-service.ts`: 计算逻辑。
- `src/earthwork-service.ts`: 远程 Mock 逻辑。
- `server.ts`: HTTP/SSE 服务端实现。

## 6. 测试指南

### 6.1 单元测试
使用 **Vitest** 确保业务逻辑准确。
- 运行测试：`npm test`
- 监听模式：`npm run test:watch`

### 6.2 协议集成测试
使用 **MCP Inspector** 验证协议合规性。
- Stdio 测试：`npx @modelcontextprotocol/inspector node dist/mcp-stdio.js`
- HTTP 测试：`npx @modelcontextprotocol/inspector http://localhost:3000/mcp`

## 7. 编译与部署

### 7.1 三种编译目标
1. **Web SPA**: `npm run build:web` -> `dist/`。
2. **Stdio NPM 包**: `npm run build:stdio` -> `dist/mcp-stdio.js`。
3. **HTTP Server**: `npm run build:server` -> `dist/mcp-server-http.js` (单文件打包)。

### 7.2 Nginx 部署示例
```nginx
location / {
    root /var/www/mcp-app/dist;
    try_files $uri $uri/ /index.html;
}
location /mcp {
    proxy_pass http://localhost:3000/mcp;
}
```

### 7.3 Docker 部署建议
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --registry=https://devwh.ccdc.com:8086/npm/
RUN npm run build
CMD ["npm", "start"]
```

## 8. 客户端配置

### 8.1 Claude Desktop 配置
- **Stdio 模式**:
  ```json
  "todo-local": { "command": "mcp-todo" }
  ```
- **SSE 模式**:
  ```json
  "todo-remote": { "url": "http://your-server:3000/sse" }
  ```

### 8.2 Cursor 配置
- 类型选择 `SSE`，URL 填入 `http://your-server:3000/sse`。

## 9. 发布与 CI/CD

### 9.1 私有仓库配置
在 `package.json` 中配置：
- `registry`: `https://devwh.ccdc.com:8086/npm/`

### 9.2 发布脚本
执行 `npm run release` 即可完成全量编译并发布至私有仓库。

## 10. 大模型技能描述 (SKILL)
项目根目录下的 `SKILL.md` 提供了供 LLM 参考的详细工具说明和最佳实践，构建时会自动拷贝至 `dist/` 目录随包发布。
