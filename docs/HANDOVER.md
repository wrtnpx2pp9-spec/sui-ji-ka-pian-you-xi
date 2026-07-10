# 喵咪互动卡片游戏项目交接文档

最后更新：2026-07-10

## 1. 项目定位

本项目是一个移动端优先的互动剧情/PWA 系统。内容生产方在工作台创建剧本、配置角色和资源、编辑剧情节点与分支，管理员审核后发布，玩家在前台体验已发布作品。

技术栈：

- Next.js 16.2.6，App Router，Turbopack
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 + SQLite
- 本地 JSON 文件和本地图片目录作为当前主要业务存储

## 2. 角色与职责边界

### 2.1 玩家

入口：`/login`、`/scripts`、`/scripts/[slug]`、`/play/[scriptId]`

职责和能力：

- 使用玩家访问口令进入前台。
- 浏览状态为 `published` 的剧本。
- 输入单个剧本的访问密码。
- 推进剧情、选择分支、查看属性变化和结局。
- 不得访问创作者工作台和管理员后台。

### 2.2 创作者

入口：`/studio/login`、`/studio`

职责和能力：

- 使用邀请码登录创作者工作台。
- 创建属于自己的剧本。
- 编辑剧本基础信息、角色、节点、分支和表现形式。
- 上传、导入和绑定美术资源。
- 使用测试入口检查剧情可玩性。
- 完成作品后提交管理员审核。
- 只能编辑本人拥有的作品，不能审核或发布作品。

创作者交付标准：

- 有明确开场节点和至少一个可到达结局。
- 非结局节点存在有效出口。
- 所有选择指向有效节点。
- 作品使用的图片资源存在且可访问。
- 内容警告、安全边界和访问密码配置合理。
- 提交审核前完成一次完整试玩。

### 2.3 管理员

入口：`/admin`、`/admin/scripts`

职责和能力：

- 查看和编辑全部创作者的剧本。
- 检查剧情结构、资源完整性、内容安全和发布质量。
- 通过审核并发布，或填写审核意见后驳回。
- 维护 `data/creators.json` 中的创作者账号状态和角色。
- 负责下架不合适或存在风险的内容。
- 对生产凭据、数据备份和发布审批承担最终责任。

管理员审核清单：

- 开场、分支和结局结构完整。
- 不存在断链选择或缺失资源。
- 内容符合产品安全和合规要求。
- AI 生成内容经过人工确认。
- 玩家入口、剧本密码和发布状态正确。
- 发布后在前台完成一次冒烟测试。

### 2.4 开发与运维

职责：

- 维护 Next.js、React、Prisma 和依赖版本。
- 在修改 Next.js 代码前阅读 `node_modules/next/dist/docs/` 中对应版本文档。
- 管理 `.env`、生产密钥、服务器目录权限和 HTTPS。
- 每次发布前执行 `npm run check`。
- 备份并恢复 `data/` 与 `public/assets/scripts/`。
- 监控磁盘空间、服务日志、构建失败和文件写入错误。
- 在引入多实例或无状态部署前完成数据库和对象存储迁移。

## 3. 主要业务流程

```text
创作者登录
  -> 创建剧本
  -> 配置基础信息/角色/资源
  -> 编辑剧情节点与选择
  -> 试玩和修正
  -> 提交审核
  -> 管理员审核
  -> 发布或驳回
  -> 玩家前台体验
```

主要状态：

- `draft`：草稿
- `editing`：编辑中
- `testing`：测试中
- `review`：等待管理员审核
- `published`：已发布
- `archived`：已下架

状态流转应通过现有 API 和页面操作完成，不要直接手工改 JSON，除非正在做数据修复且已先备份。

## 4. 目录职责

| 路径 | 职责 |
| --- | --- |
| `src/app/` | App Router 页面和 Route Handlers |
| `src/app/scripts/` | 玩家剧本列表与详情 |
| `src/app/play/` | 玩家剧情体验 |
| `src/app/studio/` | 创作者工作台 |
| `src/app/admin/` | 管理员审核后台 |
| `src/app/api/` | 登录、剧本、节点、资源和审核 API |
| `src/components/play/` | 漫画/聊天式剧情播放组件 |
| `src/components/studio/` | 创作者工作台组件 |
| `src/components/admin/` | 管理员编辑与审核组件 |
| `src/lib/script-store.ts` | 当前剧本 JSON 读写核心 |
| `src/lib/asset-folder-store.ts` | 剧本图片目录与上传文件管理 |
| `src/lib/creator-auth.ts` | 创作者会话、邀请码和权限判断 |
| `src/lib/auth.ts` | 玩家访问口令和剧本解锁 |
| `src/lib/play-engine.ts` | 剧情推进和选择逻辑 |
| `src/lib/model-api-client.ts` | 可选模型 API 接口 |
| `data/scripts.json` | 当前主要剧本数据 |
| `data/creators.json` | 创作者和管理员账号 |
| `public/assets/scripts/` | 上传的剧本资源 |
| `prisma/schema.prisma` | 计划中的结构化数据库模型 |

## 5. 新电脑接手步骤

```bash
git clone git@github.com:wrtnpx2pp9-spec/sui-ji-ka-pian-you-xi.git
cd sui-ji-ka-pian-you-xi
npm ci
```

Windows：

```powershell
Copy-Item .env.example .env
npm run setup
npm run dev
```

macOS/Linux：

```bash
cp .env.example .env
npm run setup
npm run dev
```

验证：

```bash
npm run check
```

本地地址：`http://localhost:3000`

## 6. 环境变量

| 变量 | 是否必需 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 建议 | Prisma SQLite 地址，默认 `file:./dev.db` |
| `PLAYER_ACCESS_KEY` | 生产必需 | 玩家前台访问口令 |
| `MIAOMI_SESSION_SECRET` | 生产必需 | 创作者登录会话签名密钥 |
| `MODEL_API_URL` | 可选 | 模型服务 POST 接口 |
| `MODEL_API_KEY` | 可选 | 模型服务 Bearer Token |

禁止提交 `.env`、真实密钥和线上访问口令。

当前应用启动不依赖 Prisma 数据库；`npm run setup` 只生成 Prisma 客户端。只有在试验或推进数据库迁移时才需要执行 `npm run db:push`。

## 7. 开发测试凭据

仅限本地开发：

- 玩家：`dev-access-key`
- 创作者：`creator-demo`
- 管理员：`admin-demo`

生产环境必须替换。

新增或重置邀请码：

```bash
node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('你的新邀请码').digest('hex'))"
```

将输出的 SHA-256 值写入 `data/creators.json` 对应账号的 `inviteCodeHash`。原始邀请码通过安全渠道交付，不要写入 Git。

## 8. 数据与备份

当前版本的核心数据不是由 Prisma 数据库驱动，而是直接写入本地文件：

1. `data/scripts.json`
2. `data/creators.json`
3. `public/assets/scripts/`

发布前备份示例：

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Compress-Archive -Path data,public/assets/scripts -DestinationPath "backup-$stamp.zip"
```

恢复时必须先停止服务，再覆盖文件，随后执行 `npm run check` 并人工验证三类角色入口。

## 9. 部署要求

当前推荐部署方式：

- 单实例 Node.js 服务。
- 服务器提供可持久化、可写磁盘。
- 使用 Nginx、Caddy 或平台反向代理提供 HTTPS。
- 使用进程管理器保证服务重启，例如 PM2 或 systemd。

不建议直接部署到：

- 无持久化文件系统的 Serverless 环境。
- 多实例同时写同一份 JSON 的环境。
- 只读容器且未挂载持久卷的环境。

原因：剧本和上传资源会在运行时写入本地文件。多实例会产生数据竞争，无持久化环境会在重启或重新发布后丢失数据。

## 10. 发布流程

```bash
git pull --ff-only
npm ci
npm run setup
npm run check
npm run start
```

发布后冒烟测试：

1. 玩家口令可以登录。
2. 已发布剧本可以打开并开始游戏。
3. 创作者邀请码可以登录并看到本人作品。
4. 创作者可以保存一次非关键修改。
5. 管理员可以进入审核页面。
6. 上传图片后文件仍存在且刷新可见。

## 11. 已知风险与下一步

高优先级：

- 当前 JSON 文件存储不支持可靠的并发写入和多实例部署。
- 上传资源保存在本机，缺少对象存储、容量限制和病毒扫描。
- 自动化测试覆盖不足，目前主要依赖 ESLint、生产构建和人工冒烟测试。
- 开发环境存在默认访问口令和默认会话密钥，生产环境必须覆盖。
- 创作者账号仍由 JSON 人工维护，缺少账号管理页面和密钥轮换流程。
- 截至 2026-07-10，`npm audit` 报告 7 个来自 Next.js/Prisma 间接依赖的告警；自动强制修复会降级主框架，因此未执行 `npm audit fix --force`，后续应随官方补丁版本升级复查。

建议演进顺序：

1. 为 `play-engine`、`script-health`、权限和状态流转补单元测试。
2. 抽象统一的数据仓库接口。
3. 将 `data/scripts.json` 迁移到 Prisma 数据库。
4. 将上传文件迁移到对象存储。
5. 增加账号管理、审计日志、限流和备份自动化。
6. 完成数据库迁移后再启用多实例部署。

## 12. 交接验收清单

- [ ] 接手人可以从 GitHub 克隆项目。
- [ ] `npm ci`、`npm run setup`、`npm run check` 全部通过。
- [ ] 接手人可以启动项目并打开首页。
- [ ] 玩家、创作者、管理员三个本地测试入口均可登录。
- [ ] 接手人知道核心数据和上传资源存放位置。
- [ ] 接手人知道生产密钥不能使用开发默认值。
- [ ] 已确认备份负责人、发布负责人和内容审核负责人。
- [ ] 已通过安全渠道交付生产环境变量和线上邀请码。
- [ ] 已说明当前单实例/持久化磁盘限制。
- [ ] 已记录最近一次成功发布的提交哈希。
