# 项目优化进度与下一步

更新日期：2026-06-18

这份文档记录最近这一轮代码整理已经完成的内容、当前项目状态，以及下一步建议。更完整的架构流程图见 `docs/current-flow-and-optimization.md`。

## 当前结论

项目当前已经跑通 MVP 闭环：

```txt
创作者/管理员制作剧本
-> 写入 data/scripts.json
-> 管理员审核发布
-> 前台只展示 published 剧本
-> 玩家进入 /play/:slug 游玩
```

当前真实存储仍是文件型：

- 剧本主数据：`data/scripts.json`
- 美术资源：`public/assets/scripts/:slug/*`
- 玩家游玩进度：浏览器 `localStorage`
- Prisma schema：已存在，但业务代码暂未接入

## 已完成

### 1. 梳理当前项目流程

新增文档：

- `docs/current-flow-and-optimization.md`

已梳理内容：

- 当前总览流程图
- 创作者、管理员、玩家三类角色路径
- 创作到发布流程
- 玩家游玩流程
- `NodeEditor` 当前职责拆分图
- 分阶段优化路线

### 2. 收口剧本体检逻辑

变更文件：

- `src/lib/script-health.ts`
- `src/components/admin/node-editor.tsx`

完成内容：

- 将 `NodeEditor` 内部重复的体检逻辑统一复用到 `src/lib/script-health.ts`。
- 导出 `getNodeHealth`。
- 让 `getScriptHealth` 支持传入临时 `nodes`，保留编辑器未保存状态下的即时体检能力。

收益：

- 后台节点编辑页、审核页、创作者工作台可以逐步复用同一套体检规则。
- 后续修改发布检查规则时，不需要在多个组件里重复改。

### 3. 拆分 `NodeEditor` 的健康面板

新增文件：

- `src/components/admin/node-editor-health-panels.tsx`

完成内容：

- 拆出 `ScriptHealthPanel`
- 拆出 `NodeHealthPanel`
- 拆出健康指标小组件

收益：

- `node-editor.tsx` 减少展示型代码。
- 体检结果展示可以单独维护。

### 4. 拆分 `NodeEditor` 的通用 UI 壳

新增文件：

- `src/components/admin/node-editor-ui.tsx`

完成内容：

- 拆出 `Section`
- 拆出 `PreviewStat`
- 拆出 `Field`

收益：

- 主编辑器文件更专注业务状态和编辑行为。
- 后续拆 `DialogueEditor`、`NodeInspector` 时可以继续复用这些 UI 壳。

### 5. 拆分选项编辑区

新增文件：

- `src/components/admin/node-choice-editor.tsx`

完成内容：

- 拆出 `ChoiceEditor`
- 保留原有受控数据流：`NodeEditor` 持有 `choices`，`ChoiceEditor` 只负责展示和触发回调。
- 不改变保存逻辑、不改变 API、不改变数据结构。

收益：

- `NodeEditor` 又减少一块表单复杂度。
- 后续可以在 `ChoiceEditor` 内单独增强属性变化、条件显示、关键选项标记。

## 验证记录

最近一次验证：

```bash
npm run lint
npm run build
```

结果：

- ESLint 通过
- Next.js 生产构建通过
- TypeScript 检查通过

补充说明：

- 当前目录不是 git 仓库，无法用 `git status` 查看差异。
- Windows PowerShell 默认禁用 `npm.ps1` 时，使用 `cmd /c npm run ...` 可以正常执行。

## 当前文件拆分状态

`src/components/admin/node-editor.tsx` 仍然是主编辑器，但已经拆出以下模块：

```txt
node-editor.tsx
├─ node-editor-health-panels.tsx
├─ node-editor-ui.tsx
└─ node-choice-editor.tsx
```

还留在 `node-editor.tsx` 里的主要职责：

- ReactFlow 节点图
- DAG 文本草稿解析
- 节点基础字段编辑
- 场景/聊天配置
- 角色和美术绑定
- 旁白和对白编辑
- 保存、新增、删除、AI 补草稿等操作

## 下一步建议

### 下一步 1：拆 `DialogueEditor`

优先级：高

建议新增：

- `src/components/admin/node-dialogue-editor.tsx`

要迁出的内容：

- 旁白编辑
- 对白列表
- 添加对白
- 删除/更新对白
- chat 模式下的消息方向、类型、状态、时间、图片素材字段

预期收益：

- 继续显著降低 `node-editor.tsx` 体积。
- 对白编辑后续可以单独优化，比如批量排序、折叠长对白、AI 单条补写。

### 下一步 2：拆 `NodeAssetBinder`

优先级：高

建议新增：

- `src/components/admin/node-asset-binder.tsx`

要迁出的内容：

- 背景资源选择
- 角色绑定列表
- 添加/删除角色绑定
- 角色立绘选择
- 角色站位选择

预期收益：

- 美术绑定逻辑独立后，更方便后续做“资源缺口提示”和“一键补齐默认资源”。

### 下一步 3：拆 `NodeInspector`

优先级：中

建议新增：

- `src/components/admin/node-inspector.tsx`

要迁出的内容：

- 标题、章节、节点类型
- 演出载体
- 剧情目标
- 作者把控字段
- scene/chat 配置入口

预期收益：

- 让主文件只保留状态协调和 API 操作。
- 后续可以把节点基础设定做成更清楚的分组表单。

### 下一步 4：统一状态机

优先级：中

建议新增：

- `src/lib/script-status.ts`

目标：

- 统一判断作品是否可编辑
- 统一状态流转规则
- 避免 `/api/studio/*` 和 `/api/admin/*` 里各自写状态判断

建议包含函数：

```ts
canCreatorEditScript(session, script)
canTransitionScriptStatus(from, to, actorRole)
getNextScriptStatus(action)
```

### 下一步 5：补最小测试

优先级：中

建议优先测试：

- `src/lib/play-engine.ts`
- `src/lib/script-health.ts`
- `src/lib/dag-draft.ts`

原因：

- 这些是纯函数，最容易加测试。
- 后续切 Prisma 或服务端游玩记录时，这些规则不能悄悄变。

## 暂不建议马上做的事

### 暂不建议立刻切 Prisma

原因：

- 当前 UI 和状态逻辑还在整理。
- 直接切数据层会同时影响后台、前台、上传、审核、发布。
- 建议等 `NodeEditor` 拆分和状态机完成后，再做 repository 层切换。

### 暂不建议马上重做前台游玩

原因：

- 前台当前 localStorage 方案能支撑 MVP。
- 服务端 `PlaySession` 很重要，但最好在状态机和数据层边界更清楚后做。

## 推荐执行顺序

```txt
1. 拆 DialogueEditor
2. 拆 NodeAssetBinder
3. 拆 NodeInspector
4. 建 script-status.ts
5. 补 play-engine / script-health / dag-draft 测试
6. 设计 script-repository 接口
7. 再开始 Prisma 数据层迁移
8. 最后补服务端 PlaySession / PlayEvent
```

当前最推荐下一刀：拆 `DialogueEditor`。
