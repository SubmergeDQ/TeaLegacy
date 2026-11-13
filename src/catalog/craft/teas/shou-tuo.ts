// ============================================================
// 互动产品模块：熟普沱茶
// 渥堆四十天，翻堆七次，才有这一口温润的陈香。
// ============================================================

import tuoArt from '@/assets/craft/tuo.svg'

import type { CraftTea } from '../types'

export const shouTuo: CraftTea = {
  id: 'shou-tuo',
  name: '熟普沱茶',
  sub: '勐海 · 渥堆发酵',
  art: tuoArt,
  productId: 10,
  intro: '渥堆四十天，翻堆七次，才有这一口温润的陈香。',
  duration: '约 35 秒',
  cta: '带走这沱茶',
  baseFlavors: ['陈香'],
  verdict: '汤色红浓，入口即化。天冷的时候最合适。',
  steps: [
    {
      key: 'pile',
      title: '渥堆',
      scene: 'pile',
      caption: '潮水成堆，盖上棉布',
      detail: '微生物在茶里工作，堆温升到六十度。',
      action: { type: 'hold', verb: '按住渥堆', target: 2600 },
    },
    {
      key: 'turn',
      title: '翻堆',
      scene: 'pile',
      caption: '堆心太热，翻开拌匀再堆回',
      detail: '七天一翻，翻足七次，发酵才匀。',
      action: { type: 'tap', verb: '轻点翻堆', target: 5 },
    },
    {
      key: 'break',
      title: '解块',
      scene: 'roll',
      caption: '结块的茶要搓散',
      detail: '块心不透气，搓散了才好继续走水。',
      action: { type: 'swipe', verb: '左右搓散', target: 3 },
    },
    {
      key: 'steam',
      title: '蒸软',
      scene: 'press',
      caption: '蒸汽把茶蒸软',
      detail: '蒸到一捏成团、松手即散，才好压。',
      action: { type: 'hold', verb: '按住蒸软', target: 2000 },
    },
    {
      key: 'form',
      title: '定形',
      scene: 'press',
      caption: '定下这一沱的分量',
      detail: '小沱便携，大沱陈化更稳。',
      action: {
        type: 'choose',
        verb: '选一个分量',
        target: 1,
        choices: [
          { key: 'small', label: '100g 小沱', note: '一泡一沱 · 便携', flavors: ['紧实', '耐泡'] },
          { key: 'large', label: '250g 大沱', note: '陈化更稳 · 藏得住', flavors: ['饱满', '陈香'] },
        ],
      },
    },
  ],
}
