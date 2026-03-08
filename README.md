# 图寻活跃前100监控

实时监控图寻排行榜积分变动的网页应用。

## 功能特性

- **实时监控** - 监控中国/世界排行榜前100名玩家积分变动
- **自动刷新** - 支持1-60秒可调节的自动刷新间隔
- **积分变动提醒** - 弹窗通知积分变化，显示玩家名称、变化量和当前排名
- **变动记录** - 右侧栏保存最近10条变动记录，中国和世界分开存储
- **活跃状态检测** - 高亮显示最近10分钟内有游戏的玩家
- **页面可见性检测** - 切换标签页时自动暂停刷新，返回时恢复
- **响应式设计** - 适配桌面端和移动端

## 本地运行

```bash
# 安装依赖（可选，用于部署）
npm install

# 启动本地服务器
node server.js
```

然后访问 http://localhost:8080

## 部署到 Cloudflare Workers

### 方法一：Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler deploy
```

### 方法二：GitHub + Cloudflare Pages

1. 将代码推送到 GitHub 仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
4. 选择你的 GitHub 仓库
5. 部署完成后，项目会作为 Workers 运行

## 文件说明

| 文件 | 说明 |
|------|------|
| `worker.js` | Cloudflare Workers 主文件，包含 API 代理和前端页面 |
| `index.html` | 独立 HTML 文件，用于本地测试 |
| `server.js` | 本地开发服务器 |
| `wrangler.toml` | Cloudflare Workers 配置 |
| `package.json` | 项目依赖配置 |

## 技术栈

- 纯前端 HTML/CSS/JavaScript
- Cloudflare Workers（API 代理）
- localStorage（数据持久化）

## 数据来源

数据来自 [tuxun.fun](https://tuxun.fun) API。
