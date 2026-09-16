# 从 Notion 发布博客

在 Notion 的“2025-2026年备忘录”数据库写好内容后，勾选 `发布到博客`。GitHub 会在一小时内自动发布；也可在 **Actions → Sync Notion posts → Run workflow** 立即运行。

## 一次性设置

1. 在该数据库添加属性：`发布到博客`（复选框）、`标签`（多选，可选）、`分类`（单选或多选，可选）。`名称`、`日期` 沿用现有属性。
2. 创建 Notion 内部集成，授予 **读取内容**、**更新内容** 权限，并在这个数据库的“连接”中邀请它。
3. 在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 新建：
   - Secret `NOTION_TOKEN`：Notion 集成密钥。
   - Variable `NOTION_DATABASE_ID`：备忘录数据库链接中的数据库 ID。

同步完成会自动取消 `发布到博客` 勾选，避免重复发布。修改文章后重新勾选即可；标题不变会覆盖同名文章。

脚本使用数据库 ID 自动发现 Notion 数据源。若你未来改了属性名，可在工作流中设置 `NOTION_PUBLISH_PROPERTY`、`NOTION_TITLE_PROPERTY`、`NOTION_DATE_PROPERTY`、`NOTION_TAGS_PROPERTY`、`NOTION_CATEGORY_PROPERTY` 覆盖默认名称。
