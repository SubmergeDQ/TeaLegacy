// ============================================================
// 互动产品（制茶体验）的类型
//
// 一款茶 = 一个数据模块（src/catalog/craft/teas/*.ts），
// 模块只描述自己的茶样、步骤、互动参数与成茶文案；
// 页面只认这里定义的形状，不认具体是哪一款茶。
// ============================================================

/** 工序场景：与 components/craft/scenes/index.ts 的注册表一一对应 */
export type CraftSceneKey =
  | 'garden'
  | 'wither'
  | 'wok'
  | 'roll'
  | 'press'
  | 'citrus'
  | 'sun'
  | 'pile'

export type CraftActionType = 'tap' | 'hold' | 'swipe' | 'choose'

export interface CraftChoice {
  key: string
  label: string
  /** 选项下面的一行小字：风味或手感 */
  note: string
  /** 选它之后计入成茶票签的风味词 */
  flavors: string[]
}

export interface CraftAction {
  type: CraftActionType
  /** 控制条上的动作词：轻点采下 / 按住抖炒 / 左右推揉 */
  verb: string
  /** tap、swipe 为次数；hold 为毫秒 */
  target: number
  choices?: CraftChoice[]
}

export interface CraftStep {
  key: string
  title: string
  scene: CraftSceneKey
  /** 场景下的一句操作指引（衬线大字） */
  caption: string
  /** 为什么这样做：一行工艺说明 */
  detail: string
  action: CraftAction
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
  /** 无论怎么选都成立的风味词 */
  baseFlavors: string[]
  verdict: string
}
