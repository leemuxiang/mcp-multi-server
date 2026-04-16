# MCP TodoList & Calculator 测试文档

## 1. 概述
本项目采用自动化测试确保业务逻辑的准确性和协议的合规性。测试分为单元测试（Unit Tests）和协议集成测试（Protocol Tests）。

## 2. 单元测试 (Unit Tests)
单元测试主要针对业务逻辑层（Store 和 Service），不依赖于网络或 MCP 传输层。

### 2.1 测试框架
- **Vitest**: 高性能的 TypeScript 测试框架。

### 2.2 运行测试
```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch
```

### 2.3 测试模块
- **TodoService (`src/todo-service.test.ts`)**:
  - 验证任务添加、列表获取、状态更新及删除。
- **CalculatorService (`src/calculator-service.test.ts`)**:
  - 验证加、减、乘、除基本运算及异常处理。
- **EarthworkService (`src/earthwork-service.test.ts`)**:
  - 验证异步 Mock 调用，确保工程量计算逻辑正确。

## 3. 协议测试 (Protocol Tests)
协议测试用于验证 MCP 接口的响应是否符合规范。

### 3.1 MCP Inspector
建议使用官方检查器进行手动/自动化测试：
```bash
# 测试 Stdio 模式
npx @modelcontextprotocol/inspector node dist/mcp-stdio.js

# 测试 HTTP 模式
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

### 3.2 验证要点
- `tools/list`: 确保返回所有业务工具（Todo, Calculator, Earthwork）。
- `prompts/list`: 确保返回 `analyze_todo_priority` 等提示词模板。
- `resources/list`: 确保返回 `todos://current` 资源。
