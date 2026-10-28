# 茶承 TeaLegacy

以「普洱茶非遗文化」为主题的移动端优先 H5 应用，后续可经 [PakePlus](https://github.com/Sjj1024/PakePlus) 打包为 App。

当前版本是高保真前端演示版：商城模块（商品列表 / 详情 / 购物车 / 模拟结算）完整可用，文化模块为占位页。

## 技术栈

| 项 | 选择 |
| --- | --- |
| 框架 | Vue 3（Composition API，`<script setup>`） |
| 构建 | Vite 7 |
| 语言 | TypeScript（`vue-tsc` 严格模式检查） |
| 路由 | Vue Router 4（hash 模式，便于 WebView 打包） |
| 状态 | Pinia（购物车，localStorage 持久化） |
| 样式 | SCSS + 设计令牌（CSS 变量 + SCSS 变量） |
| UI 组件 | **Oil UI**（项目内置 Vue 3 组件库，见下节） |
| 适配 | postcss-pxtorem（375 设计稿基准）+ `safe-area-inset-bottom` |
| 字体 | Noto Serif SC Variable（`@fontsource-variable`，本地托管、按字符分片按需加载） |

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
```

其他脚本：

```bash
npm run typecheck  # vue-tsc 类型检查
npm run build      # 类型检查 + 生产构建（产物在 dist/）
npm run preview    # 预览生产构建
```

## Oil UI 的安装与引入方式

### 关于包名的重要说明

**npm 上不存在名为 `oil-ui` 的 Vue 3 组件库**。写下本文时，`oil-ui`、`@oil-ui/vue`、`oil-ui-vue3`、`@oil/ui`、`oilui` 等包名在 npm registry 上全部返回 404。

因此本项目把 Oil UI 实现为**项目内置组件库**：源码位于 `src/components/oil-ui/`，以 Vue 插件方式全局注册。这与"使用 Oil UI 组件"的要求一致（模板里直接用 `<OButton>`、`<OTabbar>` 等），且不引入无法安装的依赖，`npm install` 后即可运行。

如果贵团队有私有的 Oil UI 包，只需替换这一步，其余代码不受影响。

### 引入方式

`src/main.ts`：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import OilUI from './components/oil-ui'   // ← Oil UI 插件
import './styles/base.scss'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(OilUI)                              // ← 全局注册所有组件
  .mount('#app')
```

`src/components/oil-ui/index.ts` 用 Vue 的插件协议注册组件，新增组件只需加进 `components` 数组：

```ts
import type { App } from 'vue'

const components = [OBadge, OButton, ODialog, OIcon, ONavBar, OStepper, OTabbar, OToastHost]

export default {
  install(app: App) {
    for (const c of components) app.component(c.name, c)
  },
}
```

### 组件清单

| 组件 | 用途 |
| --- | --- |
| `OButton` | 主 / 描边按钮，支持 `loading`、`block`、`size`，按下缩放反馈 |
| `OTabbar` | 底部导航，支持 `v-model`，选中指示为一块会移动的短横 |
| `ONavBar` | 次级页顶部导航，支持返回与右侧插槽 |
| `OBadge` | 数字徽标（购物车件数，>99 显示 `99+`） |
| `OStepper` | 数量加减器，含边界禁用与 44px 触屏点击区 |
| `ODialog` | 居中弹窗，`v-model` + `closeOnMask`，Esc 关闭、焦点管理 |
| `OToastHost` + `showToast()` | 函数式轻提示，支持「撤销」「去看看」等动作 |
| `OIcon` | 自绘图标集（24 viewBox、1.5px 描边、圆头端点） |

### 主题定制

设计令牌分两层，改一处即全站生效：

- `src/styles/variables.scss`：SCSS 变量（通过 `vite.config.ts` 的 `additionalData` 注入每个 SFC）
- `src/styles/base.scss`：同名的 CSS 变量（`:root`，供运行时与内联样式使用）

```scss
$o-paper: #f6f2ea;    // 宣纸底
$o-ink: #2f4f4f;      // 墨绿：品牌 / 选中
$o-primary: #6b4226;  // 茶褐：主动作 / 价格
$o-title: #322c23;    // 标题墨色
$o-line: #e7e0d2;     // 1px 细线
```

### 按需引入

组件也可单独引入，不走全局注册：

```vue
<script setup lang="ts">
import OButton from '@/components/oil-ui/OButton.vue'
import { showToast } from '@/components/oil-ui/toast'
</script>
```

## 目录结构

```text
TeaLegacy/
├─ index.html                  # 视口、根字号（rem 适配 + 桌面样机）、挂载点
├─ package.json
├─ vite.config.ts              # 别名 @、SCSS 变量注入、dev server
├─ postcss.config.mjs          # postcss-pxtorem（375 基准，1px 细线不转换）
├─ tsconfig.json
└─ src/
   ├─ main.ts                  # 应用入口：Pinia / Router / Oil UI / 字体
   ├─ App.vue                  # 全局壳：滚动容器、TabBar、页面转场、滚动位置记忆
   ├─ vite-env.d.ts
   ├─ router/
   │  └─ index.ts              # 路由表（一级 Tab / 二级全屏页）
   ├─ stores/
   │  └─ cart.ts               # Pinia 购物车（增删改、合计、localStorage 持久化）
   ├─ mock/
   │  └─ mockData.ts           # 全部 Mock 数据：8 件茶品 + 器物出处
   ├─ components/
   │  ├─ oil-ui/               # ★ Oil UI 组件库
   │  │  ├─ index.ts           #    插件入口
   │  │  ├─ OButton.vue  OTabbar.vue  ONavBar.vue  OBadge.vue
   │  │  ├─ OStepper.vue  ODialog.vue  OToastHost.vue  OIcon.vue
   │  │  ├─ icons.ts           #    自绘图标路径
   │  │  └─ toast.ts           #    函数式提示
   │  └─ shop/
   │     ├─ ProductCard.vue    # 商品卡（含"本期主推"横排变体）
   │     └─ CartSettleBar.vue  # 底部结算栏
   ├─ views/
   │  ├─ ShopView.vue          # /shop        商城首页（主视觉 + 主推 + 双列网格）
   │  ├─ ProductView.vue       # /shop/:id    商品详情
   │  ├─ CartView.vue          # /cart        购物车 + 支付成功弹窗
   │  └─ CultureView.vue       # /culture     文化占位页
   ├─ styles/
   │  ├─ variables.scss        # 设计令牌（SCSS）
   │  └─ base.scss             # reset、CSS 变量、飞入动画样式
   ├─ utils/
   │  ├─ format.ts             # 价格千分位
   │  └─ motion.ts             # 加购飞入、徽标跳动、模拟延迟
   └─ assets/
      └─ products/             # 器物图（8 张）+ SOURCES.md 许可记录
```

## 移动端适配

两层配合，手机上等比缩放，桌面上呈手机预览样机：

1. **`postcss-pxtorem`**（`postcss.config.mjs`）：以 375px 设计稿为基准，把 `px` 换算为 `rem`。`minPixelValue: 2` 让 1px 细线保持物理 1px。
2. **根字号**（`index.html`）：
   - 手机 / PakePlus WebView：`font-size: calc(100vw / 375 * 16)`，各机型等比缩放；
   - 宽屏（≥520px）：界面收成 390:844 的手机样机，根字号跟着**壳宽**算，避免内容被放大失真。
3. **安全区**：`viewport-fit=cover` + `env(safe-area-inset-bottom)` 用在 TabBar、结算栏、详情底栏与 Toast 的定位上。
4. **动态视口**：`100dvh` 适配移动端浏览器地址栏伸缩。

## 路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | → `/shop` | 默认进入商城 |
| `/shop` | 商城首页 | 一级 Tab，显示 TabBar |
| `/shop/:id` | 商品详情 | 全屏次级页，隐藏 TabBar |
| `/cart` | 购物车 | 全屏次级页，隐藏 TabBar |
| `/culture` | 文化占位页 | 一级 Tab，显示 TabBar |

## 交互与状态

- **加购**：点商品卡上的「+」→ 商品小图沿弧线飞入右上购物车图标 → 徽标跳动 +1 → 提示「已加购「…」」并提供「去看看」入口。
- **购物车**：数量加减（1–99，步进器）、删除（直接执行 + 6 秒内可撤销）、合计实时更新。
- **结算**：点「去结算」→ 按钮进入「处理中」并禁用（防重复提交）→ 约 0.9 秒后弹「支付成功」，**同时清空购物车**；结果弹窗不可点遮罩关闭，点「好的」返回空购物车状态。
- **持久化**：购物车写入 `localStorage`（键 `tea-legacy.cart.v1`），刷新或重启后读回；读回时过滤已下架商品。
- **无障碍**：触屏目标 ≥44px（部分通过伪元素扩展点击区）、弹窗 Esc 关闭与焦点归还、`prefers-reduced-motion` 下所有状态直接到位。

## Mock 数据

全部在 `src/mock/mockData.ts`：8 件商品（1 款普洱生茶饼 + 7 件茶器），含名称、副题、价格、规格、茶品志、器物出处。商品图来自博物馆开放馆藏，逐条的来源与许可记录见 [`src/assets/products/SOURCES.md`](src/assets/products/SOURCES.md)，详情页展示出处；茶饼图为商品包装照（CC BY-SA 4.0，摄影 Ash Crow），已在界面与 SOURCES.md 署名，正式上线前建议替换为自有拍摄。

## 打包为 App

```bash
npm run build     # 产物在 dist/
```

用 PakePlus 时把站点地址指向 `dist/`（或部署后的地址）即可。路由用 hash 模式，无需服务端重写规则。当前提示、弹窗、安全区均已按 WebView 全屏形态处理；桌面样机样式只在 `min-width: 520px` 时生效，不影响 App 内显示。

## 设计说明与过程记录

设计方向、评审记录与截图证据在 `.oil-ui/tea-shop/`（本地过程目录，不参与构建）。
