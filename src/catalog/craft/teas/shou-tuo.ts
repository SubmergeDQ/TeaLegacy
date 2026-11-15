// ============================================================
// 工序动画模块：普洱沱茶
// 回潮、分茶、捏成碗臼，轻压定型，通风阴干。
// ============================================================

import tuoArt from '@/assets/craft/tuo.svg'

import type { CraftTea } from '../types'

export const shouTuo: CraftTea = {
  id: 'shou-tuo',
  name: '普洱沱茶',
  sub: '碗臼形 · 一沱一泡',
  art: tuoArt,
  productId: 10,
  intro: '捏成上圆下凹的碗臼状，轻压定型，慢慢阴干。',
  duration: '约 36 秒',
  cta: '带走这沱茶',
  baseFlavors: ['紧实', '陈香'],
  verdict: '上圆下凹，松紧相宜。一沱，正好一泡。',
  steps: [
    {
      key: 'moisten',
      title: '备料回潮',
      scene: 'moisten',
      caption: '筛选普洱散茶，适度回潮',
      detail: '条索柔软，才好捏形。',
    },
    {
      key: 'weigh',
      title: '定量分茶',
      scene: 'weigh',
      caption: '按规格分出茶料',
      detail: '装入布袋，一沱一份。',
    },
    {
      key: 'shape',
      title: '捏制塑形',
      scene: 'tuoShape',
      caption: '手工捏揉，收拢茶料',
      detail: '制成上圆下凹的碗臼状沱形。',
    },
    {
      key: 'press',
      title: '紧压定型',
      scene: 'press',
      caption: '轻压固形，保持沱茶轮廓',
      detail: '松紧相宜，窝心不塌。',
      form: 'tuo',
    },
    {
      key: 'dry',
      title: '通风阴干',
      scene: 'dry',
      caption: '竹篾上摊晾，缓慢干透',
      detail: '锁住茶本香韵。',
      form: 'tuo',
    },
    {
      key: 'store',
      title: '拣选收纳',
      scene: 'store',
      caption: '筛选品相，分等级存放',
      detail: '一沱一泡，收进仓里。',
      form: 'tuo',
    },
  ],
}
