// ============================================================
// 一步一种手感
//
// 工序数据只写"做什么茶、哪几幕"，手感在这里按场景分配：
// 需要一下一下使力的（采摘、摊、揉、炒、搓、提模）都是连续轻点；
// 需要持续给力或等的（晒、压、渥堆、回潮、阴干）是按住不放。
// ============================================================

import type { CraftAction, CraftSceneKey, CraftStep } from './types'

const byScene: Record<CraftSceneKey, CraftAction> = {
  pluck: { type: 'tap', verb: '轻点采下', target: 6 },
  wither: { type: 'tap', verb: '轻点摊平', target: 4 },
  wok: { type: 'tap', verb: '轻点抖炒', target: 6 },
  roll: { type: 'tap', verb: '轻点推揉', target: 5 },
  sun: { type: 'hold', verb: '长按翻晒', target: 2400 },
  pile: { type: 'hold', verb: '按住渥堆', target: 2600 },
  spread: { type: 'tap', verb: '轻点摊开', target: 4 },
  sort: { type: 'tap', verb: '轻点拣出', target: 5 },
  store: { type: 'tap', verb: '轻点归仓', target: 4 },
  citrusPick: { type: 'tap', verb: '轻点选果', target: 3 },
  peelDry: { type: 'hold', verb: '长按晒壳', target: 2200 },
  citrusFill: { type: 'hold', verb: '按住填茶', target: 2000 },
  citrusDry: { type: 'hold', verb: '长按翻晒', target: 2400 },
  citrusRest: { type: 'hold', verb: '按住静置', target: 2200 },
  prep: { type: 'tap', verb: '轻点拣剔', target: 4 },
  blend: { type: 'tap', verb: '轻点拼配', target: 4 },
  moisten: { type: 'hold', verb: '按住回潮', target: 2000 },
  weigh: { type: 'hold', verb: '按住添茶', target: 1800 },
  bead: { type: 'tap', verb: '轻点搓珠', target: 6 },
  mold: { type: 'hold', verb: '按住填模', target: 1800 },
  press: { type: 'hold', verb: '按住压紧', target: 2400 },
  demold: { type: 'tap', verb: '轻点提模', target: 3 },
  dry: { type: 'hold', verb: '按住阴干', target: 2200 },
  wrap: { type: 'tap', verb: '轻点收布', target: 4 },
  tuoShape: { type: 'tap', verb: '轻点捏形', target: 4 },
}

/** 同一场景里的细节动作词，按紧压形态区分 */
export function actionForStep(step: CraftStep): CraftAction {
  if (step.scene === 'press') {
    const verb =
      step.form === 'cake' ? '按住压饼' : step.form === 'brick' ? '按住压砖' : '按住压形'
    return { type: 'hold', verb, target: 2400 }
  }
  if (step.scene === 'demold') {
    return {
      type: 'tap',
      verb: step.form === 'cake' ? '轻点解袋' : '轻点提模',
      target: 3,
    }
  }
  if (step.scene === 'sort') {
    return {
      type: 'tap',
      verb: step.form === 'bead' ? '轻点拣珠' : '轻点拣出',
      target: 5,
    }
  }
  return { ...byScene[step.scene] }
}
