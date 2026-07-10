# 当前项目流程与优化路线

本文档记录当前代码里的真实流程，和 `docs/mvp-design.md` 里的目标设计分开看。当前项目已经跑通了“创作/管理 -> 本地文件存储 -> 发布 -> 前台游玩”的 MVP 闭环，但数据库、服务端游玩记录、AI 任务流水线还没有真正接入。

## 1. 当前总览

```mermaid
flowchart LR
  Creator["创作者 /studio"] --> Studio["工作台<br/>作品信息/节点/美术/测试"]
  Admin["管理员 /admin"] --> AdminPanel["后台<br/>全量管理/审核/发布"]
  Player["玩家 /scripts"] --> Frontend["前台<br/>详情/解锁/游玩"]

  Studio --> StudioAPI["/api/studio/scripts/*"]
  AdminPanel --> AdminAPI["/api/admin/scripts/*"]
  Frontend --> PublicRead["readScripts / getStoredScriptBySlug"]

  StudioAPI --> Store[("data/scripts.json<br/>当前真实剧本存储")]
  AdminAPI --> Store
  PublicRead --> Store

  StudioAPI --> Assets[("public/assets/scripts/:slug/*<br/>本地美术资源")]
  AdminAPI --> Assets

  Frontend --> Play["ComicPlayer"]
  Play --> Local[("localStorage<br/>玩家本机进度")]
  Play --> ChatAPI["/api/play/chat/respond"]
  ChatAPI --> Model["MODEL_API_URL<br/>未配置则 fallback"]

  Prisma[("prisma/schema.prisma<br/>数据库目标模型")] -. "当前业务代码未使用" .-> Store
```

当前核心事实：

- 剧本主数据读写在 `src/lib/script-store.ts`，落到 `data/scripts.json`。
- 美术上传/导入在 `src/lib/asset-folder-store.ts`，文件落到 `public/assets/scripts/:slug/*`。
- Prisma schema 已经定义得比较完整，但目前没有业务调用 `prisma.*`。
- 前台游玩由 `src/components/play/comic-player.tsx` 在浏览器内推进，进度写入 `localStorage`。
- 自由聊天只在 chat 节点里调用 `/api/play/chat/respond`，再走 `persona-chat` 和可选 `MODEL_API_URL`。

## 2. 角色与权限

```mermaid
flowchart TD
  A["创作者输入邀请码<br/>/studio/login"] --> B["creator session cookie"]
  B --> C{"角色"}
  C -- creator --> D["只能编辑 ownerId 属于自己的作品"]
  C -- admin --> E["可编辑全部作品<br/>可进入 /admin"]

  D --> F{"作品状态"}
  F -- draft/editing/testing --> G["可编辑"]
  F -- review/published --> H["普通创作者不可直接编辑"]

  E --> I["审核发布<br/>approve/reject"]
```

当前权限实现集中在：

- `src/lib/creator-auth.ts`
- `src/lib/admin-auth.ts`
- `/api/studio/scripts/*`
- `/api/admin/scripts/*`

## 3. 创作到发布流程

```mermaid
flowchart TD
  A["创建作品"] --> B["createStoredScript"]
  B --> C["data/scripts.json<br/>status=draft"]

  C --> D["编辑基础信息<br/>ScriptEditor"]
  C --> E["编辑剧情节点<br/>NodeEditor + ReactFlow"]
  C --> F["上传/导入美术<br/>AssetForm / AssetFolderTools"]

  D --> G["updateStoredScript"]
  E --> H["updateStoredNode / addStoredNode / deleteStoredNode"]
  F --> I["addStoredAsset / saveStoredAssetFile"]

  G --> J["剧本体检 getScriptHealth"]
  H --> J
  I --> K["美术缺口 getScriptAssetRequirements"]

  J --> L{"提交审核条件"}
  K --> L
  L -- "有 error" --> M["继续编辑"]
  L -- "无阻塞" --> N["/api/studio/scripts/:slug/submit"]
  N --> O["status=review"]

  O --> P["管理员审核"]
  P --> Q{"健康检查 + 美术缺口 + 资源 approved"}
  Q -- "不通过" --> R["reject<br/>status=editing + reviewNotes"]
  Q -- "通过" --> S["approve<br/>status=published"]
  S --> T["出现在 /scripts"]
```

## 4. 玩家游玩流程

```mermaid
flowchart TD
  A["/"] --> B["redirect /scripts"]
  B --> C["只展示 published 剧本"]
  C --> D["/scripts/:slug"]
  D --> E{"剧本是否有 accessPassword"}

  E -- "有且未解锁" --> F["/api/scripts/:slug/unlock"]
  F --> G["写入剧本解锁 cookie"]
  G --> H["/play/:slug"]

  E -- "无密码或已解锁" --> H
  H --> I["stripScriptSecrets"]
  I --> J["ComicPlayer"]
  J --> K["读取 start node 和初始 stats"]

  K --> L{"presentation"}
  L -- scene --> M["SceneArtStage<br/>背景/立绘/旁白/选择"]
  L -- chat --> N["PhoneChatScene<br/>聊天消息/选择/自由回复"]

  M --> O{"玩家操作"}
  N --> O
  O -- "继续" --> P["lineIndex + 1"]
  O -- "选择" --> Q["应用 choice.statDelta"]
  Q --> R["进入 nextNode"]
  R --> S["应用 node.statDelta"]
  S --> J

  O -- "自由回复" --> T["/api/play/chat/respond"]
  T --> U["generatePersonaReply"]
  U --> N

  J --> V["localStorage 保存进度"]
```

当前游玩层缺口：

- 没有服务端 `PlaySession`。
- 没有 `PlayEvent` 记录。
- 结局没有进入服务端统计。
- 玩家刷新/换设备/换浏览器时无法同步进度。

## 5. 后台节点编辑器现状

`src/components/admin/node-editor.tsx` 是当前最重的单文件模块，承担了多种职责：

```mermaid
flowchart TD
  A["NodeEditor"] --> B["ReactFlow 节点图"]
  A --> C["节点字段表单"]
  A --> D["场景/聊天配置"]
  A --> E["对白编辑"]
  A --> F["角色/美术绑定"]
  A --> G["选项与跳转"]
  A --> H["DAG 文本草稿解析"]
  A --> I["节点体检"]
  A --> J["整本剧本体检"]
  A --> K["AI 草稿生成按钮"]
```

这让后续维护会越来越吃力。建议拆分为：

- `NodeFlowCanvas`：只负责 ReactFlow 节点和连线。
- `NodeInspector`：节点基础信息、presentation、scene/chat 配置。
- `DialogueEditor`：对白/旁白编辑。
- `ChoiceEditor`：选择、跳转、属性变化。
- `NodeAssetBinder`：背景、角色立绘绑定。
- `ScriptHealthPanel` / `NodeHealthPanel`：复用 `src/lib/script-health.ts` 的结果。
- `DagDraftImportPanel`：DAG 草稿导入。

## 6. 优化路线

### 阶段 A：先稳住 MVP

目标是不改变数据层，只降低维护成本。

1. 已完成：抽离 `node-editor.tsx` 的体检逻辑，统一使用 `src/lib/script-health.ts`。
2. 进行中：拆分 `NodeEditor` 子组件，先不改 UI 和 API。
   - 已完成：拆出 `ScriptHealthPanel` / `NodeHealthPanel` 到 `src/components/admin/node-editor-health-panels.tsx`。
   - 已完成：拆出 `Section` / `PreviewStat` / `Field` 到 `src/components/admin/node-editor-ui.tsx`。
   - 已完成：拆出 `ChoiceEditor` 到 `src/components/admin/node-choice-editor.tsx`。
3. 建立 `src/lib/script-status.ts`，统一状态流转和可编辑判断。
4. 修复明显的编码/文案乱码问题，避免编辑器和审核页文本不可读。
5. 为关键工具函数加最小单元测试：`play-engine`、`script-health`、`dag-draft`。

### 阶段 B：补服务端游玩记录

目标是让产品有数据基础。

1. 新增 `/api/play/sessions` 创建/读取 session。
2. 新增 `/api/play/sessions/:id/choose`，把选择推进放到服务端。
3. 写入 `PlayEvent`，记录进入节点、选择、结局。
4. 前端 `ComicPlayer` 从 localStorage-only 改成 server-first + local fallback。
5. 结局页/结局卡片接入服务端解锁记录。

### 阶段 C：切换 Prisma 数据层

目标是支持多人协作和正式部署。

1. 写 `script-repository` 接口，先让现有 JSON store 实现同一套接口。
2. 写 Prisma repository，把 `DemoScript` 和 Prisma 表结构互相转换。
3. 迁移 `data/scripts.json` 到 SQLite。
4. API 从 `script-store.ts` 切到 repository。
5. 发布前再考虑 PostgreSQL。

### 阶段 D：完善 AI 生产流水线

目标是让 AI 不只是“生成一段草稿”，而是进入可追踪的生产任务。

1. 让 `AiJob` 真正落库或落 store。
2. 任务类型拆成 outline、characters、nodes、asset_plan、node_dialogue、consistency_check。
3. AI 输出先进入待确认状态，不直接覆盖正式内容。
4. 在审核页显示 AI 未确认项。
5. 自动试玩报告基于 `PlayEvent` 或模拟器跑全图。

## 7. 优先级建议

建议先做这个顺序：

1. 先拆 `NodeEditor`，因为它已经是最大维护风险。
2. 再做统一状态机，避免发布和编辑权限散落在多个 route。
3. 再补服务端游玩 session，因为它直接决定后续数据分析和用户留存。
4. 最后切 Prisma。数据库切换很关键，但现在直接切会同时牵动后台、前台、上传、审核，适合等组件和状态逻辑稳一点再动。

如果只选一个最先动手的点：拆 `NodeEditor`，先把体检逻辑删重并组件化。这一刀收益最大，也最不影响产品行为。
