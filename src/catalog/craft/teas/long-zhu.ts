// ============================================================
// 工序动画模块：普洱龙珠
// 备料、称茶、掌间搓珠，阴干收香，一泡一颗。
// ============================================================

import beadArt from '@/assets/craft/bead.svg'

import type { CraftTea } from '../types'

export const longZhu: CraftTea = {
  id: 'long-zhu',
  name: '普洱龙珠',
  sub: '手工搓珠 · 一泡一颗',
  art: beadArt,
  productId: 13,
  intro: '掌间轻揉旋搓成珠，阴干收香。一颗，正好一泡。',
  duration: '约 30 秒',
  cta: '带走这一罐',
  baseFlavors: ['紧实', '耐泡'],
  verdict: '珠形圆润，条索不碎。一泡一颗，出汤也匀。',
  steps: [
    {
      key: 'prep',
      title: '备料',
      scene: 'prep',
      caption: '取晒青毛茶或熟散茶，拣去梗片',
      detail: '回潮软润，条索才不易搓碎。',
    },
    {
      key: 'weigh',
      title: '称茶',
      scene: 'weigh',
      caption: '均分茶料，每份分量匀整',
      detail: '方便成型，也方便日后一泡一颗。',
    },
    {
      key: 'bead',
      title: '揉团搓珠',
      scene: 'bead',
      caption: '掌间轻揉旋搓，收拢茶条',
      detail: '紧结成圆润珠状，条索不碎。',
    },
    {
      key: 'dry',
      title: '定型干燥',
      scene: 'dry',
      caption: '置于竹篾上阴干或低温风干',
      detail: '固定珠形，干透收香。',
      form: 'bead',
    },
    {
      key: 'sort',
      title: '拣选',
      scene: 'sort',
      caption: '挑出松散、碎损茶珠',
      detail: '分级存放，颗颗匀整。',
      form: 'bead',
    },
  ],
}
