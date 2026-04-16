# MCP TodoList Server 开发与部署文档

## 1. 开发指南

### 1.1 环境要求
- Node.js 18.x+
- npm 或 yarn

### 1.2 快速开始
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器（包含前端界面和 HTTP MCP 服务）：
   ```bash
   npm run dev
   ```
3. 访问地址：`http://localhost:3000`

### 1.3 核心文件说明
- `src/mcp-server.ts`: MCP 逻辑定义（工具、资源）。
- `src/todo-store.ts`: 待办事项业务逻辑。
- `src/calculator-service.ts`: 计算器业务逻辑。
- `server.ts`: HTTP 服务端实现，包含 Streamable HTTP 和 SSE 传输逻辑。
- `src/App.tsx`: 前端测试客户端。

## 2. 测试指南
请参考独立的 [测试文档](./testing.md) 了解如何运行单元测试和协议测试。

## 3. 编译与发布

本项目支持三种编译目标，满足不同的使用场景：

### 2.1 三种编译目标说明

1.  **前端静态程序 (Web SPA)**:
    -   **编译命令**: `npm run build:web`
    -   **输出目录**: `dist/` (包含 `index.html`, `assets/` 等)
    -   **部署方式**: 将 `dist/` 目录下的内容拷贝到 Nginx 的静态资源目录下。
    -   **Nginx 配置示例**:
        ```nginx
        server {
            listen 80;
            server_name your-domain.com;
            location / {
                root /var/www/mcp-todo/dist;
                try_files $uri $uri/ /index.html;
            }
            # 代理 MCP HTTP 接口
            location /mcp {
                proxy_pass http://localhost:3000/mcp;
            }
        }
        ```

2.  **Stdio 本地工具 (NPM 包)**:
    -   **编译命令**: `npm run build:stdio`
    -   **输出文件**: `dist/mcp-stdio.js` (已包含 Shebang)
    -   **发布方式**: `npm run release` 发布到私有仓库。
    -   **安装使用**: 
        ```bash
        npm install -g @your-scope/mcp-todo --registry=https://devwh.sinoccdc.com:8086/npm/
        # 在本地大模型客户端（如 Claude Desktop）中配置命令为: mcp-todo
        ```

3.  **服务端 HTTP 服务 (Node.js App)**:
    -   **编译命令**: `npm run build:server`
    -   **输出文件**: `dist/mcp-server-http.js` (单文件打包，包含依赖)
    -   **部署方式**: 拷贝该文件到服务端，直接运行：
        ```bash
        NODE_ENV=production node mcp-server-http.js
        ```
    -   **特点**: 支持 Streamable HTTP (2025-03-26) 协议，适合云端托管。

### 2.2 全量编译
执行以下命令将同时生成上述三个版本：
```bash
npm run build
```

### 2.3 发布流程
本项目配置了私有仓库地址：`https://devwh.sinoccdc.com:8086/npm/`

```bash
# 登录私有仓库
npm login --registry=https://devwh.sinoccdc.com:8086/npm/

# 执行全量编译并发布
npm run release
```

## 3. 客户端配置指南

根据您选择的部署方式，客户端配置如下：

### 3.1 Claude Desktop 配置

#### 场景 A：本地 Stdio 模式 (Version B)
1.  确保已全局安装包：`npm install -g @your-scope/mcp-todo`
2.  修改 Claude Desktop 配置文件 (`claude_desktop_config.json`):
    ```json
    {
      "mcpServers": {
        "todo-local": {
          "command": "mcp-todo"
        }
      }
    }
    ```

#### 场景 B：远程 HTTP/SSE 模式 (Version C)
1.  确保服务端已启动并可通过网络访问。
2.  修改 Claude Desktop 配置文件，使用 `url` 字段指向服务端的 `/sse` 端点：
    ```json
    {
      "mcpServers": {
        "todo-remote": {
          "url": "http://your-server-ip:3000/sse"
        }
      }
    }
    ```
    *注意：服务端支持多会话管理，每个连接都会分配独立的 Session ID。*

### 3.2 Cursor 配置
1.  打开 Cursor 设置 -> MCP。
2.  点击 "Add New MCP Server"。
3.  **Name**: `TodoServer`
4.  **Type**: 选择 `SSE`。
5.  **URL**: 输入 `http://your-server-ip:3000/sse`。

### 3.3 MCP Inspector (调试工具)
如果您想测试最新的 **Streamable HTTP** 协议，可以使用 MCP 官方检查器：
```bash
npx @modelcontextprotocol/inspector http://your-server-ip:3000/mcp
```

## 4. 部署说明

### 3.1 Docker 部署
建议使用 Docker 进行容器化部署：
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --registry=https://devwh.sinoccdc.com:8086/npm/
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 3.2 环境变量
- `NODE_ENV`: 设置为 `production` 以启用生产模式。
- `PORT`: 服务监听端口（默认 3000）。

## 4. MCP 客户端配置
若要在 Claude Desktop 中使用此服务（Stdio 模式）：
```json
{
  "mcpServers": {
    "todo-server": {
      "command": "node",
      "args": ["/path/to/dist/mcp-server.js", "--stdio"]
    }
  }
}
```
