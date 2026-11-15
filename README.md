# 茶承 TeaLegacy

以「普洱茶非遗文化」为主题的移动端优先 H5 应用，用 Capacitor 打包为 Android APK（原生工程在 `android/`）。

当前版本是高保真前端演示版，主线是「先做一遍，再买一饼」：

1. **制茶**：选一款茶（生散、熟散、小青柑、龙珠、砖茶、茶饼、沱茶）→ 五至八步互动工序（连续轻点、按住）→ 成茶票签 → 当场带走同款；
2. **商城**：只陈列这七款普洱，商品列表 / 详情 / 购物车 / 模拟结算完整可用，详情页会显示「你已亲手制成这款茶」。

## 技术栈

| 项 | 选择 |
| --- | --- |
| 框架 | Vue 3（Composition API，`<script setup>`） |
| 构建 | Vite 7 |
| 语言 | TypeScript（`vue-tsc` 严格模式检查） |
| 路由 | Vue Router 4（hash 模式，便于 WebView 打包） |
| 状态 | Pinia（购物车 + 制茶记录，均 localStorage 持久化） |
| 样式 | SCSS + 设计令牌（CSS 变量 + SCSS 变量） |
| UI 组件 | **Oil UI**（项目内置 Vue 3 组件库，见下节） |
| 图形 | 内联 SVG 线稿（24 viewBox 图标 + 320×240 工序场景 + 300×300 茶样） |
| 适配 | postcss-pxtorem（375 设计稿基准）+ 统一安全区令牌（`--o-safe-top` / `--o-safe-bottom`） |
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

## 制茶体验

入口是一级 Tab「制茶」，也是默认首页。七款茶样各五至八步，每步一种互动；互动只上报 0–1 的进度，工序图版据此刻画变化。

| 互动 | 控件 | 用在哪几步 |
| --- | --- | --- |
| `tap` | 底部控制条，连续轻点计数；每次点击补 300ms 缓出动画 | 采摘、选果、拣剔、归仓、摊平、抖炒、推揉、摊开、拼配、搓珠、收布、提模、捏形 |
| `hold` | 按住不放，控制条底部细线走完即完成 | 日光晒青、晒柑壳、烘干、渥堆、回潮、填茶、称茶、压制定型、阴干、静置 |

- **模块化数据**：`src/catalog/craft/teas/` 下**一款互动产品一个模块**，每个模块只描述自己的茶样、工序与成茶文案；新增一款茶只需新建模块，再在 `src/catalog/craft/index.ts` 登记一行，页面无需改动。每步的手感由 `src/catalog/craft/actions.ts` 按场景统一分配，数据模块不重复写控件。
- **工序场景**：`src/components/craft/scenes/` 下**每种工序图版一个组件**（茶枝与竹篓、竹筛、铁锅、竹席茶团、日光、茶堆、柑果、压架、仓架等），共用笔法在 `src/styles/scene.scss`；`CraftScene.vue` 只按 `scene` key 调度，`progress` 驱动叶片离枝、摊开、转暗、压饼等变化；不画火苗，只在锅底铺一层随按住渐浓的暖光。
- **成茶**：走完最后一步出「茶样票签」——茶样图、茶样自带风味、评语、工序回顾、价格；可当场加购、查看茶品，或「再做一遍」「换一款」。
- **记录**：成茶写入 localStorage（键 `tea-legacy.craft.v1`）。选茶页据此显示「已制成」，商品详情页显示「你已亲手制成这款茶」。
- **无障碍**：轻点与按住是原生按钮；按住支持空格 / 回车；轻点支持鼠标、触屏与键盘。

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
   │  ├─ cart.ts               # Pinia 购物车（增删改、合计、localStorage 持久化）
   │  └─ craft.ts              # Pinia 制茶记录（已制成、成茶风味，localStorage 持久化）
   ├─ catalog/                  # ★ 内容模块：商品与互动产品
   │  ├─ craft/
   │  │  ├─ index.ts            #    互动产品汇总（craftTeas / getCraftTea / getCraftByProduct）
   │  │  ├─ types.ts            #    茶样、工序、互动与紧压形态的类型
   │  │  ├─ actions.ts          #    每一步的手感：连续轻点 / 按住
   │  │  └─ teas/               #    一款互动产品一个模块
   │  │     ├─ sheng-san.ts     #      普洱生散茶
   │  │     ├─ shu-san.ts       #      普洱熟散茶
   │  │     ├─ xiao-qing-gan.ts #      小青柑
   │  │     ├─ long-zhu.ts      #      普洱龙珠
   │  │     ├─ zhuan-cha.ts     #      普洱砖茶
   │  │     ├─ sheng-bing.ts    #      普洱茶饼
   │  │     └─ shou-tuo.ts      #      普洱沱茶
   │  └─ shop/
   │     ├─ index.ts            #    商品汇总（products / getProduct / banner）
   │     ├─ types.ts            #    商品类型
   │     ├─ banner.ts           #    首屏主视觉
   │     └─ products/           #    一件商品一个模块（7 件，对应七款茶）
   ├─ components/
   │  ├─ oil-ui/               # ★ Oil UI 组件库
   │  │  ├─ index.ts           #    插件入口
   │  │  ├─ OButton.vue  OTabbar.vue  ONavBar.vue  OBadge.vue
   │  │  ├─ OStepper.vue  ODialog.vue  OToastHost.vue  OIcon.vue
   │  │  ├─ icons.ts           #    自绘图标路径
   │  │  └─ toast.ts           #    函数式提示
   │  ├─ shop/
   │  │  ├─ ProductCard.vue    # 商品卡（含"本期主推"横排变体）
   │  │  └─ CartSettleBar.vue  # 底部结算栏
   │  └─ craft/
   │     ├─ CraftScene.vue     # 工序图版调度：按 scene key 取对应组件
   │     ├─ CraftControl.vue   # 两种手感（连续轻点 / 按住）
   │     └─ scenes/            # 每种工序图版一个组件 + 注册表
   │        ├─ index.ts        #    场景注册表（pluck / wok / press ...）
   │        ├─ GardenScene.vue  WitherScene.vue  WokScene.vue
   │        ├─ RollScene.vue    SunScene.vue     PileScene.vue
   │        ├─ SortScene.vue    StoreScene.vue   CitrusScene.vue
   │        ├─ PrepScene.vue    WeighScene.vue   BeadScene.vue
   │        ├─ MoldScene.vue    PressScene.vue   DemoldScene.vue
   │        ├─ DryScene.vue     WrapScene.vue    TuoShapeScene.vue
   │        ├─ scene-utils.ts   #    进度窗口、弧线插值等共用函数
   │        └─ leaf.ts          #    全场共用的叶片路径
   ├─ views/
   │  ├─ CraftSelectView.vue   # /craft       选茶页（一级 Tab，默认首页）
   │  ├─ CraftMakeView.vue     # /craft/:id   五至八步制作 + 成茶票签
   │  ├─ ShopView.vue          # /shop        商城首页（主视觉 + 主推 + 双列网格）
   │  ├─ ProductView.vue       # /shop/:id    商品详情（含"已亲手制成"记录）
   │  └─ CartView.vue          # /cart        购物车 + 支付成功弹窗
   ├─ styles/
   │  ├─ variables.scss        # 设计令牌（SCSS）
   │  ├─ base.scss             # reset、CSS 变量（含安全区）、飞入动画样式
   │  └─ scene.scss            # 工序图版共用线条样式
   ├─ utils/
   │  ├─ format.ts             # 价格千分位
   │  └─ motion.ts             # 加购飞入、徽标跳动、模拟延迟
   └─ assets/
      ├─ products/             # 器物图（8 张）+ SOURCES.md 许可记录
      └─ craft/                # 茶样线稿（生茶饼 / 小青柑 / 熟普沱茶，自绘占位）
```

## 移动端适配

两层配合，手机上等比缩放，桌面上呈手机预览样机：

1. **`postcss-pxtorem`**（`postcss.config.mjs`）：以 375px 设计稿为基准，把 `px` 换算为 `rem`。`minPixelValue: 2` 让 1px 细线保持物理 1px。
2. **根字号**（`index.html`）：
   - 手机 / PakePlus WebView：`font-size: calc(100vw / 375 * 16)`，各机型等比缩放；
   - 宽屏（≥520px）：界面收成 390:844 的手机样机，根字号跟着**壳宽**算，避免内容被放大失真。
3. **安全区**：`viewport-fit=cover` + 统一令牌 `--o-safe-top` / `--o-safe-bottom`（Capacitor 8 注入的 `--safe-area-inset-*` 优先，浏览器退回 `env()`）。顶部由 `.app-shell` 统一让出状态栏，一级页与次级页都不会被系统栏压住；底部用于 TabBar、结算栏、详情底栏与 Toast。
4. **动态视口**：`100dvh` 适配移动端浏览器地址栏伸缩。

## 路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | → `/craft` | 默认进入制茶 |
| `/craft` | 选茶页 | 一级 Tab，显示 TabBar |
| `/craft/:id` | 五至八步制作 + 成茶 | 全屏次级页，隐藏 TabBar |
| `/shop` | 商城首页 | 一级 Tab，显示 TabBar |
| `/shop/:id` | 商品详情 | 全屏次级页，隐藏 TabBar |
| `/cart` | 购物车 | 全屏次级页，隐藏 TabBar |

## 交互与状态

- **制茶**：七款茶选一款 → 五至八步互动（连续轻点 / 按住）→ 成茶票签 → 加购或查看茶品；「再做一遍」重置本款，「换一款」回选茶页。每步完成留 0.5 秒落定再翻页，进度不因松手清零。
- **加购**：点商品卡上的「+」→ 商品小图沿弧线飞入右上购物车图标 → 徽标跳动 +1 → 提示「已加购「…」」并提供「去看看」入口。
- **购物车**：数量加减（1–99，步进器）、删除（直接执行 + 6 秒内可撤销）、合计实时更新。
- **结算**：点「去结算」→ 按钮进入「处理中」并禁用（防重复提交）→ 约 0.9 秒后弹「支付成功」，**同时清空购物车**；结果弹窗不可点遮罩关闭，点「好的」返回空购物车状态。
- **持久化**：购物车写入 `localStorage`（键 `tea-legacy.cart.v1`），制茶记录写入 `tea-legacy.craft.v1`；刷新或重启后读回，购物车读回时过滤已下架商品。
- **无障碍**：触屏目标 ≥44px（部分通过伪元素扩展点击区）、弹窗 Esc 关闭与焦点归还、`prefers-reduced-motion` 下所有状态直接到位。

## Mock 数据

- **商城**：`src/catalog/shop/products/`，一件商品一个模块（7 件，对应生散、熟散、小青柑、龙珠、砖茶、茶饼、沱茶），`src/catalog/shop/index.ts` 汇总陈列顺序；含名称、副题、价格、规格、茶品志。所有茶样图均为 `src/assets/craft/*.svg` 自绘线稿，界面与详情页标注「示意茶样图 · 项目自绘线稿（非实物拍摄）」。
- **制茶**：`src/catalog/craft/teas/`，一款互动产品一个模块（7 款 × 5–8 步），步骤文案为工艺示意，非严格教科书表述；每步手感由 `src/catalog/craft/actions.ts` 按场景分配。
- **素材**：工序场景全部为 320×240 内联 SVG 线稿，茶样图为 300×300 SVG 线稿，不依赖任何实拍图或外部图片服务。

## 打包为 APK

原生壳用 Capacitor 8（`android/` 目录由 `npx cap add android` 生成），H5 产物直接打进 WebView，离线可用。

```bash
npm run build                 # 1. 产出 dist/
npx cap sync android          # 2. 把 dist 同步进 android/app/src/main/assets/public
cd android && ./gradlew assembleDebug   # 3. 产出 APK
```

产物：`android/app/build/outputs/apk/debug/app-debug.apk`（也是 `release/TeaLegacy-1.0-debug.apk` 的来源）。

构建环境要求：

- **JDK 17–21**（本项目用 Temurin 21 验证过；JDK 24 与 AGP 8.13 不兼容，别用）
- Android SDK：`compileSdk 36` / `minSdk 24` / `targetSdk 36`，需装 build-tools 36
- 首次构建要联网下载 Gradle 与 AGP 依赖

```bash
export JAVA_HOME="$HOME/.gradle/jdks/jdk-21.0.12.1+1"
export PATH="$JAVA_HOME/bin:$PATH"
cd android && ./gradlew assembleDebug
```

原生侧改过的地方（重新 `cap add android` 会被覆盖，注意保留）：

| 位置 | 改动 |
| --- | --- |
| `res/values/strings.xml` | 应用名改成「茶承」 |
| `res/values/styles.xml` | 状态栏 / 导航栏 / 启动背景统一为宣纸色，浅色系统图标 |
| `res/mipmap-*` | 应用图标（宣纸底 + 茶褐方印「承」） |
| `src/main.ts` | 接管系统返回键：次级页回上一页，一级页才退出 |

`appId` 是 `com.tealegacy.app`，版本号在 `android/app/build.gradle` 的 `versionCode` / `versionName`。

调试版用 Android 的 debug 签名，可直接安装（需允许「未知来源」）；上架应用商店要另配 release 签名。

## 设计说明与过程记录

设计方向、评审记录与截图证据在 `.oil-ui/tea-shop/`（本地过程目录，不参与构建）。
