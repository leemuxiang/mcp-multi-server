# Multi-Service MCP Server SKILL

## 1. 概述
本 MCP 服务提供待办事项管理（TodoList）和基础算术运算（Calculator）两大核心功能。支持 Stdio 和 HTTP (SSE/Streamable) 多种传输协议。

## 2. 可用工具 (Tools)

### 2.1 待办事项 (TodoList)
- `add_todo`: 添加新任务。参数：`text` (string)。
- `list_todos`: 列出所有任务。
- `update_todo`: 更新任务。参数：`id` (string), `text`? (string), `completed`? (boolean)。
- `delete_todo`: 删除任务。参数：`id` (string)。

### 2.2 计算器 (Calculator)
- `calculate`: 执行加减乘除运算。
  - 参数：`operation` ("add" | "subtract" | "multiply" | "divide"), `a` (number), `b` (number)。

### 2.3 地质工程 (Earthwork)
- `calculate_earthwork_volumes`: 计算项目的挖填方量。
- `calculate_topsoil_area`: 计算表土面积。
- `calculate_model_volume`: 计算模型体积。
- `get_soil_layers`: 获取土层信息。
- `calculate_replacement`: 计算换填工程量。
- `calculate_total_engineering`: 计算总工程量及成本估算。

## 3. 可用提示词 (Prompts)
- `analyze_todo_priority`: 分析待办事项并建议优先级。
- `engineering_report_summary`: 生成工程地质报告摘要模板。

## 4. 可用资源 (Resources)
- `todos://current`: 获取当前所有待办事项的 JSON 视图。

## 5. 最佳实践
- 当用户提到“记录”、“任务”或“待办”时，优先使用 `add_todo`。
- 当用户需要进行数学计算时，使用 `calculate` 工具。
- 当涉及地质、工程量计算或土层分析时，使用 `earthwork` 相关工具。
- 所有的 ID 均为短字符串（如 `a1b2c3d`），在更新或删除时需准确提供。
