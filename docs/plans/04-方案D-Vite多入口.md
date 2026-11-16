# 方案 D：Vite 多入口（user + merchant 两个 HTML）

> 状态：候选｜一次性工期 2 天
> 一句话：同一仓库、同一依赖，构建出两个互相独立的入口页面，可分别部署或打包。

## 目标结构

```
TeaLegacy/
├─ index.html              # 用户端入口（现有）
├─ merchant.html           # 商家端入口（新增）
├─ vite.config.ts          # rollupOptions.input 配两个入口
├─ capacitor.config.ts     # 按 VITE_APP 切 appId/webDir（或保留 store 壳）
├─ src/
│  ├─ shared/              # oil-ui / styles / utils / catalog / 读取层
│  ├─ user/                # main.ts + App.vue + views + stores + router
│  └─ merchant/            # main.ts + App.vue + layout + views + stores + router
└─ android/                # 用户端壳；商家端另建壳或只做 Web
```

## 关键配置

```ts
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      user: resolve(__dirname, 'index.html'),
      merchant: resolve(__dirname, 'merchant.html'),
    },
  },
}
```

- 产物：`dist/index.html`、`dist/merchant.html` + 各自 chunk
- 两个入口各自 `createApp` / `createRouter`（hash 模式互不干扰）
- 字体：用户端入口引 `@fontsource`，商家端入口不引（省约 5.9 MB）

## 迁移步骤

1. 抽共享层到 `src/shared/`（做法同方案 B 第 2–5 步）
2. 现有应用入口迁到 `src/user/`（`main.ts`、`App.vue`、views、stores、router）
3. 新建 `src/merchant/main.ts` + `App.vue` + 路由 + 空壳
4. 新建 `merchant.html` 与入口配置；`npm run build:merchant` 时只构建 merchant 入口
5. Capacitor：商家端若要 APK，新建 `capacitor.merchant.config.ts`（独立 appId），否则只做 Web
6. CI 增加 merchant 构建 job；`npm run build` 默认出双入口

## 构建与分发

```bash
npm run build            # 双入口 → dist/index.html + dist/merchant.html
npm run build:merchant   # 只出商家端
```

- 可分别部署（同一静态服务器不同路径，或两个域名）
- 也可打两个 APK（`webDir` 不变，靠入口页区分；appId/appName 分别配置）

## 优点 / 代价

**优点**：商家端体积与用户端彻底分开，用户端 APK 不必含后台代码；两个入口可分别给不同人；不需要 monorepo 工具链。
**代价**：共享层必须提前抽干净（否则入口互相污染）；两个 `main.ts`/`App.vue` 有少量重复；Capacitor 双壳配置略绕。

## 何时该选

商家端要做成独立 H5 给运营用、或要独立 APK，但团队规模还不需要 monorepo。

## 验收

- [ ] 两个入口可独立打开，互不加载对方 chunk
- [ ] 用户端 APK 体积不增加
- [ ] 商家端入口不含衬线字体（体积明显更小）
- [ ] 用户端 5 页回归通过

## 风险

`shared` 抽得不干净时，用户端会间接引入商家端代码，体积白省；建议用 `rollup-plugin-visualizer` 在首次构建时确认 chunk 归属。
