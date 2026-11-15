// ============================================================
// 工序动画模块：普洱茶饼
// 拼配、称茶、布袋揉团、石模压饼，阴干入库。
// ============================================================

import cakeArt from '@/assets/craft/cake.svg'

import type { CraftTea } from '../types'

export const shengBing: CraftTea = {
  id: 'sheng-bing',
  name: '普洱茶饼',
  sub: '石模压制 · 357g',
  art: cakeArt,
  productId: 1,
  intro: '布袋揉团，石模压饼，竹架阴干。饼形圆整，存得住。',
  duration: '约 36 秒',
  cta: '带走这饼茶',
  baseFlavors: ['圆整', '回甘长'],
  verdict: '条索紧结，汤色金黄。这一饼，存得住。',
  steps: [
    {
      key: 'blend',
      title: '备料拼配',
      scene: 'blend',
      caption: '茶料拣剔拼配，喷水回潮',
      detail: '让条索柔韧不易断裂。',
    },
    {
      key: 'weigh',
      title: '称茶',
      scene: 'weigh',
      caption: '按规格称取茶料',
      detail: '放入布袋，分量先定。',
    },
    {
      key: 'wrap',
      title: '揉团包茶',
      scene: 'wrap',
      caption: '布袋收拢茶料，手工揉成圆坨',
      detail: '整理匀整，窝心才正。',
    },
    {
      key: 'press',
      title: '石模压饼',
      scene: 'press',
      caption: '置入石模压制定型',
      detail: '压出圆饼形态，窝心规整。',
      form: 'cake',
    },
    {
      key: 'demold',
      title: '脱模解袋',
      scene: 'demold',
      caption: '压好后取出，脱去布袋',
      detail: '饼形初成，边沿不散。',
      form: 'cake',
    },
    {
      key: 'dry',
      title: '阴干',
      scene: 'dry',
      caption: '竹架摊放，通风慢干',
      detail: '干透后分拣入库。',
      form: 'cake',
    },
  ],
}
