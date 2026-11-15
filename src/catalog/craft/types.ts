// ============================================================
// 工序动画（制茶体验）的类型
//
// 一款茶 = 一个数据模块（src/catalog/craft/teas/*.ts），
// 模块只描述自己的茶样、工序与成茶文案；页面按顺序播放，
// 每道工序由对应的线稿场景随进度演出。
// ============================================================

/** 工序场景：与 components/craft/scenes/index.ts 的注册表一一对应 */
export type CraftSceneKey =
  | 'pluck'
  | 'wither'
  | 'wok'
  | 'roll'
  | 'sun'
  | 'pile'
  | 'spread'
  | 'sort'
  | 'store'
  | 'citrusPick'
  | 'peelDry'
  | 'citrusFill'
  | 'citrusDry'
  | 'citrusRest'
  | 'prep'
  | 'blend'
  | 'moisten'
  | 'weigh'
  | 'bead'
  | 'mold'
  | 'press'
  | 'demold'
  | 'dry'
  | 'wrap'
  | 'tuoShape'

/** 紧压形态：压、脱模、阴干、仓储几幕共用 */
export type CraftForm = 'loose' | 'bead' | 'brick' | 'cake' | 'tuo'

/** 一步只认一种手感：连续轻点，或按住不放 */
export type CraftActionType = 'tap' | 'hold'

export interface CraftAction {
  type: CraftActionType
  /** 控制条上的动作词：轻点采下 / 轻点抖炒 / 长按翻晒 */
  verb: string
  /** tap 为次数；hold 为毫秒 */
  target: number
}

export interface CraftStep {
  key: string
  title: string
  scene: CraftSceneKey
  /** 场景里的一句工序指引（衬线大字） */
  caption: string
  /** 为什么这样做：一行工艺说明 */
  detail: string
  /** 紧压形态；散茶与柑果工序留空 */
  form?: CraftForm
}

export interface CraftTea {
  id: string
  name: string
  sub: string
  art: string
  /** 成茶时可购买的商品 id */
  productId: number
  intro: string
  duration: string
  /** 成茶后的主按钮文案 */
  cta: string
  steps: CraftStep[]
  /** 成茶票签上的风味词 */
  baseFlavors: string[]
  verdict: string
}
