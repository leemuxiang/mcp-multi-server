# MCP TodoList Server 设计文档

## 1. 概述
本项目是一个基于 **Model Context Protocol (MCP)** 规范实现的待办事项（TodoList）服务端示例。它旨在演示如何构建一个既支持本地 Stdio 传输，又支持现代 **Streamable HTTP (2025-03-26)** 传输的混合型 MCP 服务。

## 2. 设计目标
- **多传输协议支持**：同一套业务逻辑可以同时适配本地 IDE 插件（Stdio）和远程云端部署（HTTP/SSE）。
- **符合最新规范**：采用 2025-03-26 引入的 Streamable HTTP 传输方式，并兼容主流的 SSE 传输。
- **最新 SDK 架构**：使用 `@modelcontextprotocol/sdk` 1.x 版本的 `McpServer` 类，提供更现代、流式的 API。
- **多业务集成**：展示了本地存储（TodoList）、纯逻辑计算（Calculator）以及远程 Mock 调用（Earthwork）三种典型的业务场景。

## 3. 功能模块
- **待办事项 (TodoList Service)**：
  - 管理任务的增删改查，使用内存存储。
- **计算器 (Calculator Service)**：
  - 提供基础的四则运算逻辑。
- **地质工程 (Earthwork Service)**：
  - 模拟远程 HTTP 调用，提供挖填方、土层分析等工程计算功能。
- **提示词模板 (Prompts)**：
  - 提供 `analyze_todo_priority` 和 `engineering_report_summary` 模板。
- **资源 (Resources)**：
  - `todos://current`: 实时任务列表视图。

## 4. 技术栈
- **语言**: TypeScript
- **框架**: Express (HTTP Server)
- **协议库**: @modelcontextprotocol/sdk
- **前端**: React + Tailwind CSS + Lucide Icons
- **构建工具**: Vite + tsx
