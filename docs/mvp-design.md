# AI 人生模拟器 MVP 设计文档

版本：v0.1  
日期：2026-05-27  
定位：内部 AI 剧本生产后台 + 前台 PWA 互动人生模拟器

## 1. 项目定义

本项目是一个面向移动端体验的互动人生模拟 Web 应用。用户在前台浏览已经发布的剧本，进入后以漫画气泡、固定场景美术、角色立绘、旁白和选择按钮的形式推进剧情。

项目第一阶段的核心不是开放用户创作，而是建设内部生产能力：管理员可以在后台创建剧本、管理角色与美术资源、配置剧情节点和分支、调用 AI 生成剧情细节、测试游玩并发布到前台。

最终目标是形成一套可规模化生产剧本的内部工作流：人定义主题、价值观和审核边界，AI 负责辅助生成策划案、节点草稿、对白旁白、美术需求和测试报告，人工审核后发布。

### 1.1 产品一句话

一个用固定美术资源和 AI 剧情生产工作流驱动的 PWA 人生模拟器。

### 1.2 第一阶段目标

第一阶段要跑通以下闭环：

```txt
内部创建剧本
↓
配置角色
↓
配置场景和美术资源
↓
配置剧情节点
↓
配置分支选择
↓
AI 生成节点对白和旁白
↓
测试游玩
↓
审核发布
↓
用户前台游玩
```

### 1.3 第一阶段不做

第一阶段暂不做以下功能：

- 普通用户创建剧本
- 用户剧本广场
- 评论区
- 付费系统
- 排行榜
- 多人协作后台权限
- 每轮剧情实时生成图片
- 完全开放式 AI 剧情跑团
- 复杂可视化流程图编辑器

这些功能可以在生产后台稳定后逐步加入。

## 2. 目标用户和使用角色

### 2.1 前台用户

前台用户是普通玩家。用户进入 PWA 后可以：

- 浏览已发布剧本
- 查看剧本简介、标签、时长和风险提示
- 开始游玩
- 阅读旁白和角色对白
- 做出选择
- 查看属性变化
- 解锁结局
- 回看人生记录

### 2.2 内部管理员

内部管理员是平台内容生产者。管理员可以：

- 创建剧本
- 调用 AI 生成剧本草稿
- 编辑角色
- 上传或生成美术资源
- 编辑剧情节点
- 配置节点分支
- 配置结局条件
- 进行测试游玩
- 审核和发布剧本

### 2.3 后续可能扩展的内部角色

后续团队变大后可以拆分权限：

- 编剧：负责剧本策划、节点、对白规则
- 美术：负责资源上传、生成、审核、绑定
- 审核员：负责内容安全、价值观、法律风险检查
- 运营：负责上下架、推荐位、剧本标签
- 管理员：拥有全部权限

MVP 阶段只需要一个内部管理员身份。

## 3. 产品端划分

系统分成两个端：

```txt
内部后台 /admin
前台 PWA /
```

### 3.1 内部后台

内部后台只给我们自己使用，不对普通用户开放。

后台核心职责：

- 剧本生产
- AI 生成任务管理
- 美术资源管理
- 测试游玩
- 审核发布

### 3.2 前台 PWA

前台是用户真正使用的产品。

前台核心职责：

- 剧本展示
- 漫画式剧情演出
- 用户选择
- 游玩状态保存
- 结局展示
- PWA 安装体验

## 4. 参考模式

本项目不直接套用现有视觉小说引擎，但吸收几个成熟项目的设计思想。

### 4.1 Twine

Twine 的核心思想是 passage 加 links，即故事片段和跳转链接。它适合启发我们的剧情节点和分支结构。

参考：

- https://github.com/tweecode/twine
- https://twinery.org/reference/en/getting-started/basic-concepts.html

### 4.2 Yarn Spinner

Yarn Spinner 的核心思想是节点、对白行、选项和命令。它适合启发我们的运行时输出结构：节点负责剧情目的，UI 负责演出，选项负责分支。

参考：

- https://github.com/YarnSpinnerTool/YarnSpinner
- https://yarnspinner.dev/docs/yarn/02-fundamentals/02-options/

### 4.3 Ink / inkjs

Ink 偏复杂互动叙事。它的价值在于把文本叙事、变量和分支状态分离。我们不采用 Ink 语法，但借鉴状态变量和剧情分支的思路。

参考：

- https://github.com/inkle/ink
- https://github.com/y-lohse/inkjs

### 4.4 Monogatari

Monogatari 是 Web 视觉小说引擎，证明浏览器端可以做视觉小说、存档、PWA 和媒体演出体验。我们前台采用自研 UI，而不是直接使用 Monogatari。

参考：

- https://github.com/Monogatari/Monogatari

### 4.5 React Flow

React Flow 适合后续实现剧情流程图编辑。MVP 阶段先用列表和表单，第二阶段引入流程图。

参考：

- https://reactflow.dev/

## 5. MVP 剧本方向

第一批剧本建议围绕现实风险、女性成长、反诈、防操控和自救题材。

候选剧本方向：

- 女性情感骗局
- 求职陷阱
- 熟人借贷
- 虚假投资
- 职场 PUA
- 校园网贷
- 身份盗用
- 家庭控制

第一个样板剧本建议：

```txt
剧本名：《温柔陷阱》
主题：女性识别情感操控、金钱骗局和自救
形式：漫画式互动剧情
时长：10-15 分钟
节点：12-18 个
结局：4-6 个
```

这个剧本的目的不是只做一个故事，而是验证整套内部生产工作流是否可用。

## 6. 剧本生命周期

每个剧本有明确状态。

```txt
draft 草稿
ai_generating AI 生成中
editing 人工编辑中
testing 测试中
review 审核中
published 已发布
archived 已下架
```

### 6.1 状态说明

`draft`：刚创建，还未完善。  
`ai_generating`：正在执行 AI 生产任务。  
`editing`：人工编辑中。  
`testing`：进入测试游玩阶段。  
`review`：等待审核。  
`published`：发布到前台，普通用户可见。  
`archived`：从前台下架，但保留后台数据。

### 6.2 状态流转

```txt
draft
↓
ai_generating
↓
editing
↓
testing
↓
review
↓
published
↓
archived
```

允许从 `editing` 回到 `ai_generating`，用于重新生成节点或美术需求。  
允许从 `testing` 回到 `editing`，用于修复问题。  
允许从 `review` 回到 `editing`，用于审核驳回。  
允许从 `published` 回到 `editing`，用于发布后修订，但建议产生新版本。

## 7. 剧本结构

剧本不是一篇文章，而是一组可执行的结构化数据。

剧本包含：

- 基础信息
- 主题和风格
- 角色
- 美术资源
- 状态属性
- 剧情节点
- 分支选择
- 结局
- AI 生成任务记录

### 7.1 固定部分

固定部分由后台编辑和审核决定：

- 剧本主题
- 剧本价值目标
- 主要角色
- 可用场景
- 美术资源
- 节点大走向
- 关键分支
- 属性系统
- 结局条件
- 安全边界

### 7.2 AI 生成部分

AI 负责辅助生成：

- 剧本策划案草稿
- 角色设定草稿
- 节点草稿
- 分支建议
- 美术需求
- 节点对白
- 节点旁白
- 测试报告
- 逻辑漏洞检查

AI 生成结果必须进入待确认状态，不能直接发布给用户。

## 8. 后台信息架构

后台路由建议：

```txt
/admin
/admin/scripts
/admin/scripts/new
/admin/scripts/:id
/admin/scripts/:id/planning
/admin/scripts/:id/characters
/admin/scripts/:id/assets
/admin/scripts/:id/nodes
/admin/scripts/:id/nodes/:nodeId
/admin/scripts/:id/ai
/admin/scripts/:id/test
/admin/scripts/:id/review
```

### 8.1 /admin/scripts 剧本列表

功能：

- 查看所有剧本
- 搜索剧本
- 按状态筛选
- 按题材筛选
- 创建新剧本
- 进入编辑
- 复制剧本
- 下架剧本

列表字段：

- 封面
- 剧本名
- 状态
- 题材
- 节点数
- 角色数
- 美术资源数
- 最后更新时间
- 发布状态

### 8.2 /admin/scripts/new 创建剧本

字段：

- 剧本名
- 简介
- 主题
- 类型标签
- 风格
- 目标用户
- 预计游玩时长
- 是否使用 AI 辅助生成

提交后创建 `draft` 剧本。

### 8.3 /admin/scripts/:id 剧本详情

展示剧本生产进度：

```txt
策划案
角色
场景
美术资源
剧情节点
测试游玩
审核发布
```

每个步骤显示完成度：

- 是否已填写
- 是否有 AI 草稿
- 是否通过检查
- 是否存在风险项

### 8.4 /planning 策划案

字段：

- 剧本一句话
- 故事背景
- 现实意义
- 玩家目标
- 主要冲突
- 风格基调
- 内容边界
- 不允许出现的内容
- 预计节点数
- 预计结局数

### 8.5 /characters 角色管理

功能：

- 创建角色
- 编辑角色设定
- 绑定角色图
- 管理表情和姿势
- 设置角色是否前台可见

角色字段：

- 角色 ID
- 角色名
- 角色类型
- 简介
- 人设
- 与主角关系
- 剧情功能
- 安全说明
- 默认立绘
- 可用表情

角色类型：

```txt
protagonist 主角
ally 盟友
risk_object 风险对象
family 家人
authority 权威/警察/律师/老师
side 配角
system 系统旁白
```

### 8.6 /assets 美术资源

功能：

- 上传图片
- 录入资源信息
- 绑定角色
- 绑定场景
- 绑定情绪
- 标记审核状态
- 查看资源使用位置

资源类型：

```txt
cover 剧本封面
background 背景
character 角色基础立绘
expression 角色表情差分
prop 道具
ui UI 素材
```

### 8.7 /nodes 剧情节点列表

功能：

- 查看节点
- 创建节点
- 按类型筛选
- 按章节筛选
- 查看入边和出边
- 检查断链
- 复制节点

节点类型：

```txt
start 开始
normal 普通剧情
event 关键事件
choice 重大选择
ending 结局
```

### 8.8 /nodes/:nodeId 节点编辑

节点编辑页分三栏：

```txt
左侧：节点列表
中间：节点表单
右侧：漫画预览 / AI 建议
```

节点核心字段：

- 节点标题
- 节点类型
- 所属章节
- 场景背景
- 出场角色
- 默认角色图
- 剧情目标
- 情绪氛围
- 必须包含
- 禁止内容
- 节点摘要
- 旁白生成规则
- 对白生成规则
- 属性变化
- 分支选择

### 8.9 /ai AI 生成任务

功能：

- 创建 AI 任务
- 查看任务状态
- 查看输入和输出
- 应用 AI 结果
- 重跑任务
- 标记失败原因

AI 任务类型：

```txt
script_outline 生成策划案
characters 生成角色
nodes 生成节点草稿
choices 生成分支选择
endings 生成结局
asset_plan 生成美术需求
node_dialogue 生成节点对白旁白
consistency_check 一致性检查
playtest_report 自动试玩报告
repair_suggestions 修复建议
```

### 8.10 /test 测试游玩

测试游玩页模拟前台体验，但带有调试信息。

显示：

- 当前节点
- 当前属性
- 当前角色
- 当前背景
- AI 生成文本
- 玩家选择
- 跳转目标
- 分支条件是否满足

内部测试可以快速跳节点和重置状态。

### 8.11 /review 审核发布

审核项：

- 是否有开始节点
- 是否所有非结局节点都有出口
- 是否所有选择都有目标节点
- 是否所有使用的美术资源已审核
- 是否存在未确认 AI 内容
- 是否内容符合安全规则
- 是否有至少一个结局
- 是否有封面
- 是否通过测试游玩

发布前必须全部通过。

## 9. 前台信息架构

前台路由建议：

```txt
/
/scripts
/scripts/:id
/play/:scriptId
/play/:scriptId/:sessionId
/sessions
/sessions/:id
/endings/:id
/settings
```

### 9.1 首页

首页第一屏不做营销页，直接展示可玩的剧本。

内容：

- 推荐剧本
- 最新剧本
- 继续游玩
- 已解锁结局

### 9.2 剧本详情页

展示：

- 封面
- 剧本名
- 简介
- 标签
- 预计时长
- 主题提示
- 内容提示
- 开始按钮
- 继续按钮
- 已解锁结局数量

### 9.3 游玩页

游玩页是核心体验。

布局：

```txt
顶部状态栏
中间漫画演出区
底部旁白和选择区
```

移动端优先。桌面端可以把主画面居中，左右留辅助面板。

顶部状态栏：

- 剧本名
- 当前章节
- 关键属性入口
- 记录入口
- 设置入口

漫画演出区：

- 背景图全屏铺底
- 角色立绘左右站位
- 当前说话角色高亮
- 非当前角色轻微变暗
- 角色旁边显示气泡
- 道具图可浮层展示

底部区：

- 旁白框
- 选择按钮
- 继续按钮
- 可选自由输入框

MVP 阶段建议先只做选择，不做完全自由输入。后续加入自由输入后，AI 需要判断用户输入对应哪个意图或是否触发剧情。

## 10. 漫画演出 UI 规范

### 10.1 画面比例

移动端：

- 主体验以竖屏为主
- 演出区占 65%-75% 高度
- 底部交互区占 25%-35%

桌面端：

- 中间限制最大宽度
- 推荐 390-480px 的移动模拟宽度
- 或使用 16:9 横向视觉小说模式

第一版建议移动端优先。

### 10.2 背景

背景资源要求：

- 建议尺寸：1440x2560 或 1080x1920
- 格式：WebP 优先
- 内容留出角色站位和文字空间
- 不要过亮或细节过密
- 可以加前端暗角或模糊遮罩提高可读性

### 10.3 角色立绘

角色立绘资源要求：

- 透明背景 PNG 或 WebP
- 半身优先
- 竖向尺寸统一
- 面向镜头或略侧身
- 同一角色保持一致服装、发型和画风

建议每个主要角色：

```txt
头像：1 张
半身立绘：8-12 张
全身立绘：1-2 张，可选
情绪差分：普通、微笑、担心、生气、冷淡、震惊、哭泣、坚定
动作差分：拿手机、坐着、转身、低头，可选
```

配角：

```txt
头像：1 张
半身立绘：4-6 张
```

### 10.4 气泡

气泡用 CSS 实现，不用图片。

规则：

- 气泡跟随说话角色站位
- 左侧角色气泡尖角向左
- 右侧角色气泡尖角向右
- 气泡最大宽度不超过屏幕 70%
- 文本过长时换行
- 每个气泡只承载一段对白

### 10.5 旁白框

旁白框放在底部选择区上方或演出区下缘。

规则：

- 半透明深色底
- 白色或浅色文字
- 不遮挡角色面部
- 只写环境、心理、动作，不写长篇说明

### 10.6 选择按钮

选择按钮固定在底部。

规则：

- 每个节点最多 4 个选择
- 文案尽量 6-16 字
- 关键选择可加风险标记，但不要直接告诉用户正确答案
- 禁止使用过度诱导式 UI

### 10.7 状态变化提示

选择后可以轻提示：

```txt
清醒值 +5
经济风险 +10
社交支持 -5
```

是否显示具体数值由剧本配置决定。部分沉浸式剧本可以只显示“你感到更不安了”。

## 11. 美术资源系统

### 11.1 资源分类

```txt
cover 剧本封面
background 背景图
character 角色基础图
expression 表情差分
pose 姿势差分
prop 道具图
ui UI 素材
```

### 11.2 资源字段

```txt
id
script_id
character_id
type
name
description
file_url
thumbnail_url
emotion
pose
scene_key
style_tags
prompt
negative_prompt
source
status
created_at
updated_at
```

`source` 可选：

```txt
manual_upload 人工上传
ai_generated AI 生成
stock 素材库
placeholder 占位图
```

`status` 可选：

```txt
draft
generating
needs_review
approved
rejected
```

### 11.3 资源复用原则

不要每个节点都生成新图。一个剧本建议：

```txt
背景：6-8 张
主要角色：3-5 个
每个主要角色：8-12 张表情/姿势
配角：2-4 个
道具：5-10 张
封面：1 张
```

### 11.4 节点绑定资源

每个节点绑定：

```txt
background_asset_id
character_asset_bindings
prop_asset_ids
```

示例：

```json
{
  "background": "apartment_night",
  "characters": [
    {
      "character_id": "heroine",
      "asset_id": "heroine_worried_phone",
      "position": "left"
    },
    {
      "character_id": "man",
      "asset_id": "man_gentle_smile",
      "position": "right"
    }
  ],
  "props": ["phone_chat_screen"]
}
```

## 12. 数据模型

开发期可用 SQLite，正式期切 PostgreSQL。ORM 推荐 Prisma。

### 12.1 Script 剧本

```txt
id
slug
title
subtitle
description
theme
style
tags
target_audience
content_warning
status
cover_asset_id
estimated_minutes
version
is_published
published_at
created_at
updated_at
```

### 12.2 ScriptPlanning 剧本策划案

```txt
id
script_id
logline
background
meaning
player_goal
main_conflict
tone
safety_boundary
forbidden_content
node_count_target
ending_count_target
created_at
updated_at
```

### 12.3 Character 角色

```txt
id
script_id
key
name
role_type
description
personality
relationship_to_protagonist
narrative_function
safety_notes
default_asset_id
sort_order
created_at
updated_at
```

### 12.4 Asset 美术资源

```txt
id
script_id
character_id
type
key
name
description
file_url
thumbnail_url
emotion
pose
scene_key
style_tags
prompt
negative_prompt
source
status
created_at
updated_at
```

### 12.5 StoryStat 剧本属性

每个剧本可以定义自己的属性。

```txt
id
script_id
key
name
description
min_value
max_value
initial_value
is_visible_to_player
sort_order
```

《温柔陷阱》示例属性：

```txt
clarity 清醒值
trust 信任值
emotional_dependency 情绪依赖
economic_risk 经济风险
social_support 社交支持
evidence 证据完整度
self_esteem 自尊值
safety 安全值
```

### 12.6 StoryNode 剧情节点

```txt
id
script_id
key
title
node_type
chapter
summary
goal
tone
must_include
forbidden
background_asset_id
character_bindings
prop_asset_ids
stat_delta
entry_condition
ai_prompt
generated_narration
generated_dialogues
is_locked
sort_order
created_at
updated_at
```

`node_type`：

```txt
start
normal
event
choice
ending
```

`character_bindings` 示例：

```json
[
  {
    "character_id": "heroine",
    "asset_id": "heroine_worried",
    "position": "left"
  },
  {
    "character_id": "man",
    "asset_id": "man_smile",
    "position": "right"
  }
]
```

### 12.7 StoryChoice 分支选择

```txt
id
script_id
node_id
text
description
next_node_id
stat_delta
condition
is_key_choice
sort_order
created_at
updated_at
```

`condition` 示例：

```json
{
  "clarity": { "gte": 40 },
  "evidence": { "gte": 20 }
}
```

### 12.8 Ending 结局

结局可以作为 `StoryNode` 的一种，也可以单独建表。MVP 建议单独建表并关联 ending 节点。

```txt
id
script_id
node_id
key
title
description
ending_type
condition
rank
created_at
updated_at
```

`ending_type`：

```txt
good
neutral
bad
hidden
true
```

### 12.9 AiJob AI 任务

```txt
id
script_id
node_id
job_type
status
input_json
output_json
error_message
model
token_input
token_output
cost_estimate
created_by
created_at
updated_at
completed_at
```

`status`：

```txt
pending
running
completed
failed
cancelled
applied
```

### 12.10 PlaySession 游玩记录

```txt
id
script_id
user_id
current_node_id
status
stats_json
visited_node_ids
unlocked_ending_id
started_at
updated_at
ended_at
```

`status`：

```txt
playing
ended
abandoned
```

### 12.11 PlayEvent 游玩事件

```txt
id
session_id
node_id
choice_id
event_type
stats_before
stats_after
rendered_narration
rendered_dialogues
created_at
```

`event_type`：

```txt
enter_node
choose
ending
restart
```

## 13. AI 生产工作流

AI 生产必须按步骤运行，不能一次性让 AI 生成所有东西并直接发布。

### 13.1 工作流步骤

```txt
1. 生成剧本策划案
2. 生成角色设定
3. 生成剧情节点草稿
4. 生成分支选择
5. 生成结局条件
6. 生成美术资源需求
7. 生成节点对白/旁白
8. 一致性检查
9. 自动试玩报告
10. 人工审核
```

### 13.2 AI 生成剧本策划案

输入：

```txt
主题
目标用户
现实意义
期望时长
期望节点数
风险边界
```

输出：

```json
{
  "title": "温柔陷阱",
  "logline": "一个年轻女生在亲密关系中识别情感操控与金钱骗局，并选择自救的互动故事。",
  "theme": "情感操控与反诈",
  "tone": "现实、悬疑、克制、女性成长",
  "player_goal": "识别危险信号，保护自己，建立求助和证据意识",
  "main_conflict": "渴望被理解和保持清醒之间的冲突",
  "forbidden_content": [
    "不要提供可执行诈骗教程",
    "不要指责受害者",
    "不要美化操控关系"
  ]
}
```

### 13.3 AI 生成角色

输出格式：

```json
{
  "characters": [
    {
      "key": "heroine",
      "name": "林夏",
      "role_type": "protagonist",
      "description": "25 岁，刚进入城市工作，努力独立但情感支持较少。",
      "personality": "敏感、认真、渴望被理解",
      "narrative_function": "玩家代入角色，承担判断和选择",
      "visual_requirements": [
        "日常通勤装",
        "自然写实漫画风",
        "需要担心、坚定、疲惫、释然等表情"
      ]
    }
  ]
}
```

### 13.4 AI 生成节点

节点输出格式：

```json
{
  "nodes": [
    {
      "key": "first_borrow_money",
      "title": "第一次借钱",
      "node_type": "event",
      "chapter": "试探",
      "summary": "男方以资金周转为由第一次向女主借钱。",
      "goal": "呈现情绪施压和金钱试探",
      "tone": "温柔、委屈、压迫感逐渐出现",
      "must_include": [
        "男方称资金临时周转不开",
        "男方暗示女主不够信任他",
        "女主犹豫"
      ],
      "forbidden": [
        "不要出现详细诈骗操作流程",
        "不要让女主被羞辱"
      ]
    }
  ]
}
```

### 13.5 AI 生成对白旁白

输入：

- 剧本策划案
- 当前节点
- 角色设定
- 已确认安全边界
- 当前属性
- 上一个选择

输出：

```json
{
  "narration": "出租屋的灯光有些暗，手机屏幕亮起来时，雨声正贴着窗户落下。",
  "dialogues": [
    {
      "speaker": "man",
      "emotion": "gentle",
      "text": "我不是非要你帮，只是现在真的只有你能让我松一口气。"
    },
    {
      "speaker": "heroine",
      "emotion": "hesitant",
      "text": "你需要多少？为什么这么突然？"
    }
  ]
}
```

AI 不允许在这个步骤新增分支，分支必须来自 `StoryChoice`。

### 13.6 AI 生成美术需求

输出：

```json
{
  "assets": [
    {
      "key": "apartment_night",
      "type": "background",
      "name": "出租屋夜晚",
      "usage_nodes": ["opening", "first_borrow_money"],
      "prompt": "small rented apartment at night, warm desk lamp, realistic manga style, vertical composition",
      "notes": "画面要留出左右角色站位和底部文字空间"
    },
    {
      "key": "heroine_worried_phone",
      "type": "expression",
      "character": "heroine",
      "emotion": "worried",
      "pose": "holding phone",
      "prompt": "young Chinese woman holding phone, worried expression, half body, transparent background, realistic manga style"
    }
  ]
}
```

MVP 阶段可以只生成需求，不自动生成图片。第二阶段接图片生成 API。

### 13.7 一致性检查

AI 检查项：

- 是否所有节点符合主题
- 是否出现未定义角色
- 是否出现未定义资源
- 是否分支逻辑混乱
- 是否存在自相矛盾
- 是否有内容安全风险
- 是否结局条件合理

输出：

```json
{
  "passed": false,
  "issues": [
    {
      "severity": "high",
      "node_key": "first_borrow_money",
      "message": "节点提到了未定义角色“表姐”。",
      "suggestion": "改为已定义角色“闺蜜”。"
    }
  ]
}
```

## 14. 内容安全和价值边界

项目题材可能涉及诈骗、情感操控、借贷、心理压力和现实伤害，因此必须做内容边界。

### 14.1 不允许

- 提供详细诈骗教程
- 美化操控关系
- 把受害归因为愚蠢
- 鼓励极端复仇
- 鼓励自伤或暴力
- 暴露隐私获取技巧
- 生成可执行违法步骤
- 过度渲染羞辱、恐吓或血腥内容

### 14.2 应该强调

- 保留证据
- 及时止损
- 向可信赖的人求助
- 咨询法律或警方
- 保护身份信息和账户安全
- 识别情绪勒索
- 不把爱和牺牲混为一谈

### 14.3 剧本内容提示

每个剧本详情页显示内容提示，例如：

```txt
本剧本包含情感操控、金钱风险、关系压力等内容。剧情用于风险教育和互动体验，不构成法律建议。
```

## 15. 前台运行逻辑

### 15.1 进入节点

用户进入节点时：

```txt
读取 StoryNode
↓
读取绑定资源
↓
读取 generated_narration 和 generated_dialogues
↓
应用节点 stat_delta
↓
展示演出
↓
显示可用选择
```

### 15.2 选择分支

用户选择后：

```txt
记录 PlayEvent
↓
应用 choice.stat_delta
↓
检查 next_node_id
↓
进入下一个节点
```

### 15.3 条件分支

如果选择有条件：

```txt
检查当前 stats_json
↓
符合则显示
↓
不符合则隐藏或置灰
```

MVP 建议隐藏不满足条件的选择，减少解释成本。后续可以显示“需要更高证据完整度”之类的提示。

### 15.4 结局判断

进入 ending 节点后：

```txt
保存 ended 状态
写入 ending_records
展示结局页
允许重新开始或分享
```

MVP 可以通过明确 `next_node_id` 进入结局。后续再支持根据属性自动判定结局。

## 16. PWA 范围

MVP 支持基本 PWA 体验：

- Web App Manifest
- 可添加到桌面
- 独立窗口打开
- 缓存静态资源
- 缓存已加载剧本资源
- 离线时显示已缓存内容或离线提示

### 16.1 Manifest

配置：

```txt
name
short_name
description
start_url
display: standalone
background_color
theme_color
icons
```

### 16.2 Service Worker

缓存策略：

- 应用壳：预缓存
- 图片资源：Cache First
- API 数据：Network First
- 游玩记录：本地存储后同步，后续支持

MVP 可先实现应用安装和静态资源缓存，离线同步后续做。

## 17. API 设计

### 17.1 后台 API

```txt
GET    /api/admin/scripts
POST   /api/admin/scripts
GET    /api/admin/scripts/:id
PATCH  /api/admin/scripts/:id
DELETE /api/admin/scripts/:id

GET    /api/admin/scripts/:id/characters
POST   /api/admin/scripts/:id/characters
PATCH  /api/admin/characters/:characterId
DELETE /api/admin/characters/:characterId

GET    /api/admin/scripts/:id/assets
POST   /api/admin/scripts/:id/assets
PATCH  /api/admin/assets/:assetId
DELETE /api/admin/assets/:assetId

GET    /api/admin/scripts/:id/nodes
POST   /api/admin/scripts/:id/nodes
GET    /api/admin/nodes/:nodeId
PATCH  /api/admin/nodes/:nodeId
DELETE /api/admin/nodes/:nodeId

POST   /api/admin/nodes/:nodeId/choices
PATCH  /api/admin/choices/:choiceId
DELETE /api/admin/choices/:choiceId

POST   /api/admin/scripts/:id/ai-jobs
GET    /api/admin/scripts/:id/ai-jobs
GET    /api/admin/ai-jobs/:jobId
POST   /api/admin/ai-jobs/:jobId/apply

POST   /api/admin/scripts/:id/publish
POST   /api/admin/scripts/:id/archive
```

### 17.2 前台 API

```txt
GET    /api/scripts
GET    /api/scripts/:id
POST   /api/play/sessions
GET    /api/play/sessions/:sessionId
POST   /api/play/sessions/:sessionId/choose
GET    /api/play/sessions/:sessionId/events
```

### 17.3 文件上传 API

```txt
POST /api/admin/uploads
```

返回：

```json
{
  "file_url": "/uploads/assets/xxx.webp",
  "thumbnail_url": "/uploads/assets/thumb_xxx.webp"
}
```

MVP 本地存储即可。正式部署可换 S3、R2 或 Supabase Storage。

## 18. 技术架构

### 18.1 推荐技术栈

```txt
Next.js
TypeScript
React
Tailwind CSS
Prisma
SQLite 开发期
PostgreSQL 正式期
Zustand
React Flow 第二阶段
PWA Manifest + Service Worker
```

### 18.2 目录结构建议

```txt
app/
  page.tsx
  scripts/
  play/
  admin/
    scripts/
components/
  admin/
  play/
  ui/
lib/
  ai/
  db/
  play/
  scripts/
  validation/
prisma/
  schema.prisma
public/
  assets/
  icons/
docs/
  mvp-design.md
```

### 18.3 前端状态管理

前台游玩状态使用 Zustand 或 React Context。

状态包括：

```txt
sessionId
script
currentNode
stats
dialogueIndex
isAutoPlaying
visitedNodes
```

后台编辑状态以服务端数据为准，表单局部状态使用 React Hook Form。

## 19. 成本控制

### 19.1 文本 AI 成本

文本生成主要用于内部生产，不是每个用户每轮都调用。

MVP 前台运行读取已经生成好的节点内容，不实时调用 AI。这样用户越多，AI 成本不会线性增长。

### 19.2 图片成本

图片生成成本高，必须控制：

- 不每轮生成图片
- 不每个节点生成独立背景
- 角色图复用
- 背景图复用
- 图片生成进入人工确认
- 未审核图片不发布

### 19.3 AI 调用策略

```txt
策划案：一次
角色：一次
节点：一次或按章节
对白旁白：按节点生成
美术需求：一次
一致性检查：发布前一次
```

## 20. 测试策略

### 20.1 数据完整性测试

发布前检查：

- 有且只有一个 start 节点
- 所有非 ending 节点至少一个出口
- 所有 choice.next_node_id 存在
- 没有孤立节点，除非标记为 unused
- 所有资源状态为 approved
- 所有角色引用存在

### 20.2 前台演出测试

检查：

- 背景加载
- 角色位置正确
- 气泡不溢出
- 选择按钮可点击
- 移动端文字不重叠
- PWA 安装正常

### 20.3 内容测试

检查：

- 是否符合剧本主题
- 是否存在风险内容
- 是否对白风格统一
- 是否结局合理
- 是否有受害者指责倾向

### 20.4 AI 输出测试

检查：

- JSON 是否可解析
- 是否符合 schema
- 是否新增未定义分支
- 是否引用未定义角色
- 是否违反 forbidden 规则

## 21. MVP 开发阶段

### 阶段 1：项目骨架

目标：

- Next.js 项目
- Tailwind
- Prisma
- SQLite
- 基础 PWA manifest
- 后台基础布局
- 前台基础布局

### 阶段 2：核心数据 CRUD

目标：

- 剧本 CRUD
- 角色 CRUD
- 资源 CRUD
- 节点 CRUD
- 选择 CRUD

### 阶段 3：前台游玩闭环

目标：

- 剧本列表
- 剧本详情
- 创建游玩 session
- 进入节点
- 点击选择跳转
- 进入结局

### 阶段 4：漫画演出 UI

目标：

- 背景铺底
- 角色立绘站位
- 气泡对白
- 旁白框
- 选择按钮
- 属性提示

### 阶段 5：AI 辅助生产

目标：

- AI job 表
- 生成策划案
- 生成角色
- 生成节点
- 生成对白旁白
- 应用 AI 输出

### 阶段 6：测试和发布

目标：

- 测试游玩页面
- 发布前检查
- 剧本状态流转
- 前台只显示 published

## 22. 第一版验收标准

项目第一版完成时，应满足：

- 后台可以创建一个剧本
- 后台可以创建角色
- 后台可以上传并绑定美术资源
- 后台可以创建 10 个以上剧情节点
- 后台可以配置分支和结局
- 后台可以调用 AI 生成节点对白旁白
- 后台可以测试游玩完整剧本
- 剧本可以发布到前台
- 前台用户可以完整玩到结局
- 前台 UI 是漫画气泡式演出
- PWA 可以添加到桌面

## 23. 样板剧本《温柔陷阱》规格

### 23.1 基础设定

```txt
女主：25 岁，刚进入城市工作，独立生活
主题：亲密关系中的情绪操控和金钱风险
目标：让玩家识别危险信号，保护自己，建立求助意识
```

### 23.2 主要角色

```txt
林夏：女主
周予安：风险对象
许然：闺蜜
母亲：家庭支持
民警/律师：后期求助角色
```

### 23.3 场景

```txt
出租屋夜晚
公司工位
咖啡馆
手机聊天界面
银行转账确认页
闺蜜家
派出所/法律咨询室
```

### 23.4 属性

```txt
清醒值
信任值
情绪依赖
经济风险
社交支持
证据完整度
自尊值
安全值
```

### 23.5 剧情阶段

```txt
初遇：他出现得刚刚好
升温：过度体贴和情绪绑定
隔离：他开始否定她的朋友
试探：第一次借钱或投资暗示
控制：争吵、愧疚、威胁分手
反击：收集证据、求助、确认真相
结局：沉没、止损、维权、成长
```

### 23.6 结局

```txt
及时清醒：损失很小，女主识别危险信号
温柔债务：一次次妥协，背上债务
被孤立的人：疏远朋友和家人后陷入困境
证据链：冷静收集证据并成功止损
重新成为自己：经历伤害后重建生活
```

## 24. 后续扩展路线

### 24.1 第二阶段

- React Flow 剧情流程图
- 图片生成 API
- 多剧本模板
- 批量 AI 生成
- 自动试玩
- 更完善 PWA 离线能力

### 24.2 第三阶段

- 用户账号
- 游玩云存档
- 剧本推荐
- 结局收藏
- 分享卡片
- 运营后台

### 24.3 第四阶段

- 用户剧本创作
- 用户剧本广场
- 创作者审核机制
- 模板市场
- 多人协作创作

## 25. 当前定版结论

第一阶段项目定版为：

```txt
内部 AI 剧本生产后台
+ 固定美术资源管理
+ 节点分支剧本结构
+ AI 生成对白/旁白/节点草稿
+ 漫画气泡式前台 PWA
```

核心原则：

- 大走向由人和后台结构控制
- AI 负责提高生产效率
- 图片资源固定复用
- 用户只玩已发布内容
- 内容必须人工审核后发布
- MVP 先跑通生产闭环，再扩展社区和用户创作
