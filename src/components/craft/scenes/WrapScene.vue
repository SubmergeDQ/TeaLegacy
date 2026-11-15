<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 揉团包茶：布摊在桌上，四边收拢，把茶团裹成圆坨系住。
// 布面用椭圆而不是正圆，底边一直压在桌面上，不会切进地面。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const cx = 160
const cy = 166
const outerRx = computed(() => 78 - p.value * 26)
const outerRy = 48
const innerRx = computed(() => 40 * (1 - p.value) ** 1.45)
const innerRy = computed(() => 26 * (1 - p.value) ** 1.45)

/** 布只从左右收，竖向保持高度：茶团始终包在布里，布底也一直贴着桌面 */
const clothCy = cy

function ellipseLoop(rx: number, ry: number, wobble: number, phase = 0): string {
  const n = 12
  let d = ''
  for (let i = 0; i < n; i += 1) {
    const a1 = (i / n) * Math.PI * 2
    const a2 = ((i + 1) / n) * Math.PI * 2
    const k1 = 1 + wobble * Math.sin(i * 3 + phase)
    const k2 = 1 + wobble * Math.sin((i + 1) * 3 + phase)
    const p1 = {
      x: cx + Math.cos(a1) * rx * k1,
      y: clothCy + Math.sin(a1) * ry * k1,
    }
    const p2 = {
      x: cx + Math.cos(a2) * rx * k2,
      y: clothCy + Math.sin(a2) * ry * k2,
    }
    const mid = {
      x: cx + Math.cos((a1 + a2) / 2) * rx * 1.08,
      y: clothCy + Math.sin((a1 + a2) / 2) * ry * 1.08,
    }
    if (i === 0) d += `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
    d += ` Q${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return `${d} Z`
}

const outerClothPath = computed(() => ellipseLoop(outerRx.value, outerRy, 0.045))

/** 布面：外圈布褶 + 收口的不规则洞 */
const clothPath = computed(() => {
  let d = outerClothPath.value
  if (innerRx.value > 0.8) {
    d += ` ${ellipseLoop(innerRx.value, innerRy.value, 0.07, 1.2)}`
  }
  return d
})

/** 布褶：角度与弯度都不对称，避免看起来像车轮辐条 */
const foldSpec = [
  { a: 0.6, bend: 0.34, reach: 0.9 },
  { a: 2.05, bend: -0.18, reach: 0.8 },
  { a: 3.5, bend: 0.22, reach: 0.87 },
  { a: 5, bend: 0.42, reach: 0.78 },
]

const folds = computed(() =>
  foldSpec.map((f, i) => {
    const a = f.a + p.value * (0.2 + i * 0.05)
    const x1 = cx + Math.cos(a) * (innerRx.value + 4)
    const y1 = clothCy + Math.sin(a) * (innerRy.value + 4)
    const xm = cx + Math.cos(a + f.bend) * outerRx.value * 0.56
    const ym = clothCy + Math.sin(a + f.bend) * outerRy * 0.6
    const x2 = cx + Math.cos(a + f.bend * 0.4) * outerRx.value * f.reach
    const y2 = clothCy + Math.sin(a + f.bend * 0.4) * outerRy * f.reach
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${xm.toFixed(1)} ${ym.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }),
)

const knot = computed(() => clamp01((p.value - 0.5) / 0.34))
const knotY = computed(() => clothCy - outerRy - 2)

/** 收口边缘：一圈贴着洞口的布沿，读得出"开口" */
const openingRimPath = computed(() =>
  ellipseLoop(innerRx.value + 3.5, innerRy.value + 3, 0.09, 2.2),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <clipPath id="wrapClothClip">
        <path :d="outerClothPath" />
      </clipPath>
    </defs>

    <!-- 桌上的茶团：先画茶，再用布从四面收上来 -->
    <circle class="s-tea-deep" cx="160" cy="154" r="30" />
    <path class="s-line s-thin" d="M136 148 q12 -8 26 -4" opacity="0.5" />
    <path class="s-line s-thin" d="M138 162 q14 7 30 1" opacity="0.45" />
    <path class="s-line s-thin" d="M152 138 q10 5 20 1" opacity="0.35" />

    <!-- 布：外圈起伏，中间留一个不规则的收口 -->
    <path class="s-cloth s-line" fill-rule="evenodd" :d="clothPath" />
    <g clip-path="url(#wrapClothClip)">
      <path
        v-if="innerRx > 1"
        class="s-line s-thin"
        :d="openingRimPath"
        fill="none"
        opacity="0.45"
      />
      <g class="s-line s-thin" :style="{ opacity: 0.2 + p * 0.4 }">
        <path v-for="(d, i) in folds" :key="`f${i}`" :d="d" />
      </g>
    </g>

    <!-- 收口的结：跟着布面一起收拢、抬起来 -->
    <g
      :style="{ opacity: knot }"
      :transform="`translate(160 ${knotY}) scale(${0.7 + knot * 0.3}) translate(-160 ${-knotY})`"
    >
      <path class="s-line s-thin" :d="`M160 ${knotY + 4} q-18 -16 -2 -24 q14 8 2 24`" />
      <path class="s-line s-thin" :d="`M160 ${knotY + 4} q18 -16 2 -24 q-14 8 -2 24`" />
      <path class="s-cloth s-line s-thin" :d="`M152 ${knotY + 2} h16 v 10 h-16 z`" />
    </g>

    <path class="s-line s-thin s-faint" d="M26 216 H294" />
  </svg>
</template>
