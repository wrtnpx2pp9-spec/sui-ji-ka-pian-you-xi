# 喵咪互动卡片游戏

一个基于 Next.js 16、React 19 和 TypeScript 的互动剧情/PWA 项目。系统包含玩家前台、创作者工作台和管理员审核后台，支持剧本创建、节点编排、美术资源上传、试玩、审核和发布。

## 快速开始

环境要求：

- Node.js 20.9 或更高版本
- npm 10 或更高版本
- Git

```bash
git clone git@github.com:wrtnpx2pp9-spec/sui-ji-ka-pian-you-xi.git
cd sui-ji-ka-pian-you-xi
npm ci
```

复制环境变量模板：

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

生成 Prisma 客户端：

```bash
npm run setup
```

当前业务数据使用 JSON 文件，不依赖 SQLite 才能启动。需要试验 Prisma 数据库时，再单独执行 `npm run db:push`。

启动开发环境：

```bash
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 本地测试账号

以下账号只用于本地开发，不应直接用于公网生产环境：

| 入口 | 地址 | 本地测试凭据 |
| --- | --- | --- |
| 玩家前台 | `/login` | `dev-access-key` |
| 创作者工作台 | `/studio/login` | `creator-demo` |
| 管理员后台 | `/studio/login` | `admin-demo` |

生产环境必须在 `.env` 中设置新的 `PLAYER_ACCESS_KEY` 和 `MIAOMI_SESSION_SECRET`，并替换 `data/creators.json` 中的测试邀请码哈希。

## 常用命令

```bash
npm run dev              # 启动开发服务器
npm run lint             # ESLint 检查
npm run build            # 生产构建
npm run start            # 启动生产服务器
npm run check            # 连续执行 lint 和 build
npm run setup            # 生成 Prisma 客户端
npm run db:push          # 可选：同步 Prisma SQLite 结构
npm run prisma:studio    # 打开 Prisma Studio
```

## 角色职责

- **玩家**：浏览已发布剧本、输入作品密码、推进剧情、做出选择并查看结局。
- **创作者**：创建和维护本人剧本、上传资源、编辑节点和分支、试玩并提交审核。
- **管理员**：查看全部剧本、执行内容审核、批准发布或驳回、维护创作者账号。
- **开发/运维**：维护代码、环境变量、数据备份、构建发布和生产安全配置。

更完整的职责边界、目录说明、上线流程、备份要求和已知风险见 [项目交接文档](docs/HANDOVER.md)。

## 数据存储说明

当前业务主数据仍使用本地文件：

- `data/scripts.json`：剧本、节点、角色、资源引用和发布状态
- `data/creators.json`：创作者/管理员账号和邀请码哈希
- `public/assets/scripts/`：用户上传的剧本图片资源

`prisma/schema.prisma` 和 SQLite 已保留用于后续数据库迁移，但当前主要业务读写仍由 JSON 文件完成。因此生产部署必须使用**可持久化磁盘的单实例 Node.js 服务**，不能把当前版本直接部署到无持久化文件系统或多实例环境。

## 生产运行

```bash
npm ci
npm run setup
npm run check
npm run start
```

上线前至少完成：

1. 替换所有开发凭据。
2. 备份 `data/` 和 `public/assets/scripts/`。
3. 确认运行目录可写且磁盘可持久化。
4. 使用反向代理启用 HTTPS。
5. 验证玩家、创作者和管理员三条完整流程。
