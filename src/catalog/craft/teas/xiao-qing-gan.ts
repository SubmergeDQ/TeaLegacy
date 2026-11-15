// ============================================================
// 工序动画模块：小青柑（柑普茶）
// 青柑挖瓤、填熟普、生晒，一颗一泡。
// ============================================================

import citrusArt from '@/assets/craft/citrus.svg'

import type { CraftTea } from '../types'

export const xiaoQingGan: CraftTea = {
  id: 'xiao-qing-gan',
  name: '小青柑',
  sub: '新会青柑 · 填入熟普',
  art: citrusArt,
  productId: 9,
  intro: '选柑、晒壳、填茶、生晒，柑香与茶味慢慢交融。',
  duration: '约 36 秒',
  cta: '带走这一盒',
  baseFlavors: ['柑香', '醇厚'],
  verdict: '柑香先出，茶味随后。一颗，正好一泡。',
  steps: [
    {
      key: 'pick',
      title: '选柑',
      scene: 'citrusPick',
      caption: '择新会青柑，果皮饱满油室细密',
      detail: '旋挖去瓤，留柑壳，洗净沥干。',
    },
    {
      key: 'dry-peel',
      title: '晒柑壳',
      scene: 'peelDry',
      caption: '通风阴晒，缓散水汽',
      detail: '保留柑皮清芬，不令焦燥。',
    },
    {
      key: 'prepare',
      title: '备茶',
      scene: 'prep',
      caption: '取普洱熟散茶，拣剔除杂',
      detail: '干度合宜，填入壳中才不返潮。',
    },
    {
      key: 'fill',
      title: '填茶',
      scene: 'citrusFill',
      caption: '熟茶徐徐填入柑壳',
      detail: '松紧适度，留出转化空间。',
    },
    {
      key: 'dry',
      title: '烘干 / 生晒',
      scene: 'citrusDry',
      caption: '或日光慢晒，或低温慢烘',
      detail: '令柑香与茶香相融，柑壳收干而不焦。',
    },
    {
      key: 'rest',
      title: '静置陈放',
      scene: 'citrusRest',
      caption: '收于通风干爽处',
      detail: '待柑香茶味慢慢交融蕴化。',
    },
  ],
}
