// ============================================================
// 互动产品模块：新会小青柑
// 果皮还青的时候摘下，挖空、填茶、生晒，一颗一泡。
// ============================================================

import citrusArt from '@/assets/craft/citrus.svg'

import type { CraftTea } from '../types'

export const xiaoQingGan: CraftTea = {
  id: 'xiao-qing-gan',
  name: '新会小青柑',
  sub: '青柑壳 · 填入熟普',
  art: citrusArt,
  productId: 9,
  intro: '果皮还青的时候摘下，挖空、填茶、生晒，一颗一泡。',
  duration: '约 35 秒',
  cta: '带走这一盒',
  baseFlavors: ['柑香'],
  verdict: '柑香先出，茶味随后。一颗，正好一泡。',
  steps: [
    {
      key: 'pick',
      title: '选果',
      scene: 'citrus',
      caption: '果皮青亮、油胞饱满时采下',
      detail: '青柑未红时香气最盛，个头匀，才填得进茶。',
      action: { type: 'tap', verb: '轻点选果', target: 3 },
    },
    {
      key: 'open',
      title: '开盖',
      scene: 'citrus',
      caption: '沿果肩划一圈，掀盖不裂皮',
      detail: '刀口只破皮、不伤肉，果壳才立得住。',
      action: { type: 'swipe', verb: '左右划一圈', target: 3 },
    },
    {
      key: 'scoop',
      title: '挖果',
      scene: 'citrus',
      caption: '挖净果肉，留下空壳',
      detail: '果肉挖净、白络留一点，柑香与茶香才咬得住。',
      action: { type: 'hold', verb: '按住挖果', target: 2000 },
    },
    {
      key: 'fill',
      title: '填茶',
      scene: 'citrus',
      caption: '填入哪一种茶，风味就此定下',
      detail: '填熟普则醇厚，填生普则清冽。',
      action: {
        type: 'choose',
        verb: '选一种茶填入',
        target: 1,
        choices: [
          { key: 'ripe', label: '填熟普', note: '醇厚 · 柑香压得住', flavors: ['醇厚', '陈香'] },
          { key: 'raw', label: '填生普', note: '清冽 · 回甘更利', flavors: ['清冽', '回甘'] },
        ],
      },
    },
    {
      key: 'sun',
      title: '生晒',
      scene: 'sun',
      caption: '日晒三日，水气慢慢走',
      detail: '不烘不焙，果皮的香气才留得住。',
      action: { type: 'hold', verb: '按住翻晒', target: 2400 },
    },
  ],
}
