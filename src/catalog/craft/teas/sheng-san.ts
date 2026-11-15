// ============================================================
// 工序动画模块：普洱生散茶（晒青毛茶）
// 采、萎、炒、揉、晒，五步入晒青毛茶。
// ============================================================

import looseRawArt from '@/assets/craft/raw-loose.svg'

import type { CraftTea } from '../types'

export const shengSan: CraftTea = {
  id: 'sheng-san',
  name: '普洱生散茶',
  sub: '晒青毛茶 · 云南大叶种',
  art: looseRawArt,
  productId: 11,
  intro: '采、萎、炒、揉、晒，五步成晒青毛茶。条索完整，山野气还在。',
  duration: '约 30 秒',
  cta: '带走这款生散茶',
  baseFlavors: ['山野气', '清香'],
  verdict: '条索紧结，汤色浅金。这一口，是山野本来的样子。',
  steps: [
    {
      key: 'pluck',
      title: '鲜叶采摘',
      scene: 'pluck',
      caption: '云南大叶种，一芽二叶',
      detail: '芽叶饱满，带着山野气韵；提手采下，切口才不发黑。',
    },
    {
      key: 'wither',
      title: '摊凉萎凋',
      scene: 'wither',
      caption: '薄置通风阴凉处，缓缓散除表层水汽',
      detail: '青气收敛，叶质柔润，才好下锅。',
    },
    {
      key: 'kill-green',
      title: '杀青',
      scene: 'wok',
      caption: '铁锅炒制，抖闷相济',
      detail: '钝化酶促活性，褪去青涩；叶色转沉绿，柔韧出锅。',
    },
    {
      key: 'roll',
      title: '揉捻',
      scene: 'roll',
      caption: '轻揉塑形，挤出茶汁',
      detail: '叶片蜷曲成条索，茶味潜藏于脉络之间。',
    },
    {
      key: 'sun',
      title: '日光晒青',
      scene: 'sun',
      caption: '借日光徐徐干燥，慢走水气',
      detail: '锁住本真清香，方成晒青毛茶。',
    },
  ],
}
