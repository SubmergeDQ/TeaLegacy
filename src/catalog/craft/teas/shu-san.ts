// ============================================================
// 工序动画模块：普洱熟散茶（渥堆熟茶）
// 晒青之后渥堆发酵，摊晾、拣剔，八步成温润熟散。
// ============================================================

import looseRipeArt from '@/assets/craft/ripe-loose.svg'

import type { CraftTea } from '../types'

export const shuSan: CraftTea = {
  id: 'shu-san',
  name: '普洱熟散茶',
  sub: '渥堆熟茶 · 勐海',
  art: looseRipeArt,
  productId: 12,
  intro: '晒青、渥堆、摊晾、拣剔，八步成温润熟散。堆味散尽，陈香初成。',
  duration: '约 48 秒',
  cta: '带走这款熟散茶',
  baseFlavors: ['陈香', '温润'],
  verdict: '汤色红浓，入口温润。天冷的时候，最合适。',
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
      detail: '锁住本真清香，得到晒青毛茶。',
    },
    {
      key: 'pile',
      title: '渥堆发酵',
      scene: 'pile',
      caption: '洒水堆集，定时翻堆散结',
      detail: '使茶料均匀发酵，苦涩渐化，温润香气慢慢滋生。',
    },
    {
      key: 'spread',
      title: '摊晾出堆',
      scene: 'spread',
      caption: '发酵到位，开沟薄摊阴晾',
      detail: '褪去燥意，散去堆味。',
    },
    {
      key: 'sort',
      title: '拣剔分级',
      scene: 'sort',
      caption: '筛除粗梗杂片，分拣品相',
      detail: '静置养香，方可收存。',
      form: 'loose',
    },
  ],
}
