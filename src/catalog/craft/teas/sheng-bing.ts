// ============================================================
// 互动产品模块：老班章生茶饼
// 采、萎、炒、揉、压，五步成一饼。
// ============================================================

import cakeArt from '@/assets/craft/cake.svg'

import type { CraftTea } from '../types'

export const shengBing: CraftTea = {
  id: 'sheng-bing',
  name: '老班章生茶饼',
  sub: '布朗山 · 头春古树',
  art: cakeArt,
  productId: 1,
  intro: '采、萎、炒、揉、压，五步成一饼。存得住的山野气。',
  duration: '约 40 秒',
  cta: '带走这饼茶',
  baseFlavors: ['山野气', '回甘长'],
  verdict: '条索紧结，汤色金黄。这一饼，存得住。',
  steps: [
    {
      key: 'pluck',
      title: '采青',
      scene: 'garden',
      caption: '一芽二叶，指腹轻提',
      detail: '掐断的切口会发黑，提手采下的芽叶才匀整。',
      action: { type: 'tap', verb: '轻点采下', target: 6 },
    },
    {
      key: 'wither',
      title: '萎凋',
      scene: 'wither',
      caption: '薄摊竹筛，让水分散一散',
      detail: '摊到三指厚，青气散去，叶片柔软如绸，才好下锅。',
      action: { type: 'swipe', verb: '左右摊平', target: 3 },
    },
    {
      key: 'kill-green',
      title: '杀青',
      scene: 'wok',
      caption: '铁锅一百八十度，抖炒断青',
      detail: '高温钝化酶活性，止住发酵。手不离茶，茶不离锅。',
      action: { type: 'hold', verb: '按住抖炒', target: 2600 },
    },
    {
      key: 'roll',
      title: '揉捻',
      scene: 'roll',
      caption: '掌根压住茶团，揉到条索紧结',
      detail: '先轻后重，破壁出汁；茶汁裹上条索，才有后来的回甘。',
      action: { type: 'swipe', verb: '左右推揉', target: 4 },
    },
    {
      key: 'press',
      title: '蒸压',
      scene: 'press',
      caption: '蒸汽软化，石磨压成饼',
      detail: '357 克一饼，松紧适度，留出后期转化的余地。',
      action: { type: 'hold', verb: '按住压饼', target: 2200 },
    },
  ],
}
