// ============================================================
// 工序动画模块：普洱砖茶
// 筛拣拼配、回潮、入模、压制，方方正正一砖。
// ============================================================

import brickArt from '@/assets/craft/brick.svg'

import type { CraftTea } from '../types'

export const zhuanCha: CraftTea = {
  id: 'zhuan-cha',
  name: '普洱砖茶',
  sub: '方正紧压 · 利于仓储',
  art: brickArt,
  productId: 14,
  intro: '称茶入模，压成方正一砖，阴干入仓，静待转化。',
  duration: '约 36 秒',
  cta: '带走这一砖',
  baseFlavors: ['方正', '陈化稳'],
  verdict: '砖面平整，松紧适中。入仓，等时间做事。',
  steps: [
    {
      key: 'prep',
      title: '备料',
      scene: 'prep',
      caption: '筛拣普洱散茶，按配方拼配',
      detail: '适度回潮增柔，压出的砖才不散边。',
    },
    {
      key: 'mold',
      title: '称茶入模',
      scene: 'mold',
      caption: '定量茶料填入方形模具',
      detail: '铺放平整，砖面才平。',
    },
    {
      key: 'press',
      title: '压制成型',
      scene: 'press',
      caption: '施以压力紧压',
      detail: '使茶料固结为方正砖形，松紧适中。',
      form: 'brick',
    },
    {
      key: 'demold',
      title: '脱模',
      scene: 'demold',
      caption: '待压力稳定，脱去模具',
      detail: '初成茶砖，边角完整。',
      form: 'brick',
    },
    {
      key: 'dry',
      title: '阴干晾置',
      scene: 'dry',
      caption: '通风处慢慢阴干',
      detail: '散去水汽，避免外干内潮。',
      form: 'brick',
    },
    {
      key: 'store',
      title: '分级仓储',
      scene: 'store',
      caption: '检视品相，剔除残次',
      detail: '入仓静待转化。',
      form: 'brick',
    },
  ],
}
