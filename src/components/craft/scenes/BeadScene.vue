<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { arcPoint, clamp01, easeOut, lerp, window01 } from './scene-utils'

// 揉团搓珠：一团茶在掌间收拢，搓成一颗颗圆珠，落到竹匾上。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const targets = [
  { x: 104, y: 168 },
  { x: 160, y: 164 },
  { x: 216, y: 168 },
  { x: 132, y: 188 },
  { x: 160, y: 188 },
  { x: 188, y: 188 },
  { x: 104, y: 206 },
  { x: 160, y: 208 },
  { x: 216, y: 206 },
]

const beads = computed(() =>
  targets.map((t, i) => {
    const k = easeOut(window01(p.value, 0.08 + i * 0.075, 0.4 + i * 0.075))
    const start = { x: 160 + (i % 3 - 1) * 16, y: 146 + (i % 2) * 6 }
    const pos = arcPoint(start.x, start.y, t.x, t.y, k, 16 + (i % 3) * 4)
    return {
      ...t,
      x: pos.x,
      y: pos.y,
      s: lerp(0.18, 1, k),
      k,
    }
  }),
)

const mass = computed(() => 1 - p.value * 0.85)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 竹匾 -->
    <ellipse class="s-paper s-line" cx="160" cy="186" rx="116" ry="34" />
    <ellipse class="s-line s-thin s-faint" cx="160" cy="186" rx="102" ry="26" />
    <g class="s-line s-thin s-faint">
      <path d="M52 180 H268" />
      <path d="M60 194 H260" />
    </g>

    <!-- 还没搓完的茶团 -->
    <g
      :style="{ opacity: Math.max(0, 1 - p * 2.2) }"
      :transform="`translate(160 146) scale(${mass}) translate(-160 -146)`"
    >
      <path
        fill="#8a6a44"
        fill-opacity="0.85"
        stroke="var(--o-ink)"
        stroke-width="1.2"
        d="M160 118 c 24 -2 38 12 39 28 c 1 17 -18 29 -40 29 c -23 0 -40 -12 -39 -29 c 1 -16 16 -26 40 -28 z"
      />
      <g class="s-line s-thin" opacity="0.35">
        <path d="M138 136 q14 -6 28 -2" />
        <path d="M140 152 q18 7 34 1" />
      </g>
    </g>

    <!-- 旋搓的圈：手在掌间转，珠子才圆 -->
    <g :style="{ opacity: 0.55 * Math.max(0, 1 - p * 2.5) }">
      <circle
        class="s-line s-thin"
        cx="160"
        cy="146"
        r="44"
        stroke-dasharray="6 9"
        :transform="`rotate(${p * 200} 160 146)`"
      />
      <path class="s-line s-thin" d="M104 132 q-8 14 0 28" />
      <path class="s-line s-thin" d="M216 132 q8 14 0 28" />
    </g>

    <!-- 搓成的茶珠：刚起手的那颗淡入，避免托盘上方出现一个孤零零的小点 -->
    <g
      v-for="(b, i) in beads"
      :key="`b${i}`"
      :style="{ opacity: Math.min(1, b.k * 3) }"
      :transform="`translate(${b.x} ${b.y}) scale(${b.s})`"
    >
      <circle class="s-tea-deep" r="10" />
      <path class="s-line s-thin" d="M-4 -3 q4 -3 8 0" opacity="0.4" />
      <path class="s-line s-thin" d="M-4 3 q4 2 8 0" opacity="0.3" />
    </g>

    <path class="s-line s-thin s-faint" d="M32 218 H288" />
  </svg>
</template>
