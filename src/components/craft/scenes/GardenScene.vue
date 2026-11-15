<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { LEAF } from './leaf'
import { arcPoint, clamp01, easeOut, lerp, window01 } from './scene-utils'

// 鲜叶采摘：一芽二叶离枝，沿弧线落入竹篓。
// 叶柄都落在茶枝的贝塞尔曲线上，采下时不会出现悬空的缝。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

/** 枝头叶片：锚点取自主干与侧枝的曲线，贴着枝子长 */
// target 决定采摘先后：从枝梢往里采，顶芽留到最后一下，
// 这样中途主干顶端始终带叶，不会看着像一根断掉的杆
const branchLeaves = [
  { x: 120, y: 58, r: -22, s: 1.0, target: 11 },
  { x: 104, y: 96, r: 28, s: 1.05, target: 10 },
  { x: 92, y: 123, r: -150, s: 1.02, target: 9 },
  { x: 82, y: 148, r: 18, s: 1.04, target: 8 },
  { x: 69, y: 177, r: -145, s: 0.98, target: 7 },
  { x: 57, y: 202, r: 12, s: 0.95, target: 6 },
  { x: 110, y: 147, r: -32, s: 1.05, target: 5 },
  { x: 140, y: 129, r: 24, s: 1.0, target: 3 },
  { x: 172, y: 110, r: -16, s: 0.96, target: 1 },
  { x: 125, y: 107, r: 34, s: 1.04, target: 4 },
  { x: 154, y: 94, r: -26, s: 1.0, target: 2 },
  { x: 184, y: 84, r: 18, s: 0.94, target: 0 },
]

/** 竹篓里的落点：都在篓口以内，外层再套一道裁切，叶不会穿出篓壁 */
const basketSpots = [
  { x: 226, y: 182, r: -24 },
  { x: 240, y: 178, r: 18 },
  { x: 252, y: 182, r: -8 },
  { x: 228, y: 192, r: 30 },
  { x: 242, y: 190, r: -16 },
  { x: 252, y: 194, r: 12 },
  { x: 230, y: 202, r: -28 },
  { x: 244, y: 202, r: 22 },
  { x: 252, y: 204, r: -10 },
  { x: 234, y: 210, r: 8 },
  { x: 248, y: 210, r: -24 },
  { x: 238, y: 214, r: 16 },
]

const movingLeaves = computed(() =>
  branchLeaves.map((l) => {
    // 每两片一组：一次轻点正好带两片叶子下枝
    const pair = Math.floor(l.target / 2)
    const wait = pair / 6
    const end = (pair + 1) / 6
    const t = easeOut(window01(p.value, wait, end))
    const spot = basketSpots[l.target]
    const pos = arcPoint(l.x, l.y, spot.x, spot.y, t, 30 + l.target * 1.2)
    return {
      ...l,
      x: pos.x,
      y: pos.y,
      r: lerp(l.r, spot.r, t),
      s: lerp(l.s, 0.6, t),
      t,
    }
  }),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <clipPath id="pluckBasketClip">
        <path d="M214 174 h64 l-7 36 a 10 10 0 0 1 -10 8 h-30 a 10 10 0 0 1 -10 -8 z" />
      </clipPath>
    </defs>

    <!-- 远山与地面 -->
    <path class="s-line s-thin s-faint" d="M18 214 Q34 192 76 212" />
    <path class="s-line s-thin s-faint" d="M238 212 Q278 194 302 216" />
    <path class="s-line s-thin s-faint" d="M24 228 H296" />

    <!-- 茶枝：侧枝起点压进主干，叶柄都落在枝线上，不会有断口 -->
    <path class="s-line" d="M46 222 C 70 178 92 124 120 58" />
    <path class="s-line s-thin" d="M73 168 Q92 156 110 147 Q126 137 140 129 Q156 119 172 110" />
    <path class="s-line s-thin" d="M86 136 Q105 120 125 107 Q140 100 154 94 Q170 88 184 84" />
    <path class="s-line s-thin" d="M56 204 C 92 192 126 178 156 168" />

    <!-- 枝头芽叶：采下的那几片沿弧线走 -->
    <path
      v-for="(l, i) in movingLeaves"
      :key="`leaf${i}`"
      class="s-leaf"
      :d="LEAF"
      :style="{ opacity: l.t < 0.99 ? 1 : 0 }"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`"
    />

    <!-- 侧枝末端留一片不采的嫩叶，枝子不至于光秃 -->
    <path
      class="s-leaf"
      :d="LEAF"
      transform="translate(156 168) rotate(-10) scale(0.68)"
    />

    <!-- 竹篓：先画篓身，再画落到篓里的叶，最后补前沿；篓底落在地面上 -->
    <ellipse cx="246" cy="223" rx="38" ry="5" fill="#2f4f4f" opacity="0.06" />
    <path
      class="s-paper s-line"
      d="M208 170 h76 l-8 42 a 12 12 0 0 1 -12 10 h-40 a 12 12 0 0 1 -12 -10 z"
    />
    <path class="s-line s-thin" d="M208 170 a 38 11 0 0 0 76 0" />
    <path class="s-line s-thin" d="M212 186 H282" />
    <path class="s-line s-thin" d="M214 200 H279" />
    <path class="s-line s-thin" d="M220 214 H270" />
    <path class="s-line s-thin" d="M214 172 a 32 30 0 0 1 64 0" />

    <!-- 篓内的叶子统一裁在篓壁以内，避免穿模 -->
    <g clip-path="url(#pluckBasketClip)">
      <path
        v-for="(s, i) in basketSpots"
        :key="`full${i}`"
        class="s-leaf"
        :d="LEAF"
        :style="{ opacity: movingLeaves[i].t >= 0.99 ? 0.94 : 0 }"
        :transform="`translate(${s.x} ${s.y}) rotate(${s.r}) scale(0.6)`"
      />
    </g>
  </svg>
</template>
