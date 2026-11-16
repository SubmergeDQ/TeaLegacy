# 文档索引

本仓库按「用户端（C 端）/ 商家端（B 端）」两部分组织，所有设计与技术文档集中在 `docs/`。

| 文档 | 内容 | 状态 |
|---|---|---|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发指南：环境、命令、目录地图、身份入口、P0 顺序、约定、FAQ | ✅ |
| [../CHANGELOG.md](../CHANGELOG.md) | 变更记录（按日期） | ✅ |
| [architecture/user-app.md](./architecture/user-app.md) | 用户端完整架构说明（技术栈、目录、适配、路由、状态、打包 APK） | 已实现 |
| [architecture/merchant-app.md](./architecture/merchant-app.md) | 商家端开发文档（页面规格、数据层、组件增量、里程碑、验收） | M0 已落地，P0 待开发 |
| [plans/00-方案对比.md](./plans/00-方案对比.md) | 商家端 4 个落地方案总览与推荐 | ✅ 已选 A |
| plans/01-04 | 四个方案的目标结构、迁移步骤与工期 | ✅ A 已落地 M0 |
| [DECISIONS.md](./DECISIONS.md) | 决策记录（ADR）：方案、组件库、图表、分发形态 | ✅ 已定稿 |
| [design/README.md](./design/README.md) | 设计过程记录约定 | 约定 |

## 约定

1. 新文档一律放 `docs/`，文件名用「小写-连字符」或「00-方案对比」这类可排序的编号。
2. `docs/` 不参与构建，`npm run build` 不会读取。
3. 决策一旦定稿，写进 `DECISIONS.md`，正文文档同步更新，不留在聊天记录里。
4. 设计截图、对比页等大文件放 `docs/design/`，并注明来源与日期。
