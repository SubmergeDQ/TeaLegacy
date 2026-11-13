<script setup lang="ts">
import { computed } from 'vue'

import { LEAF } from './leaf'

// 萎凋：一坨鲜叶随进度摊开成薄薄一层
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))

const witherTargets = [
  { x: 84, y: 110, r: -22, sx: -6, sy: -4 },
  { x: 116, y: 96, r: 16, sx: 4, sy: -8 },
  { x: 152, y: 92, r: -8, sx: 8, sy: 2 },
  { x: 192, y: 98, r: 28, sx: -4, sy: 6 },
  { x: 226, y: 112, r: -34, sx: 6, sy: -2 },
  { x: 100, y: 134, r: 12, sx: -8, sy: 4 },
  { x: 138, y: 128, r: -18, sx: 2, sy: -6 },
  { x: 176, y: 132, r: 22, sx: -6, sy: 8 },
  { x: 212, y: 142, r: -12, sx: 8, sy: -4 },
  { x: 112, y: 162, r: 26, sx: -2, sy: 6 },
  { x: 152, y: 164, r: -26, sx: 6, sy: -2 },
  { x: 190, y: 160, r: 8, sx: -8, sy: 4 },
]
const witherLeaves = computed(() =>
  witherTargets.map((t) => ({
    // 未摊开时挤在中间，靠 jitter 撑出一捧的体积，而不是一个点
    x: 160 + (t.x - 160) * p.value + t.sx * (1 - p.value) * 2.4,
    y: 136 + (t.y - 136) * p.value + t.sy * (1 - p.value) * 2.4,
    r: t.r,
  })),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <ellipse class="s-paper s-line" cx="160" cy="136" rx="120" ry="54" />
    <ellipse class="s-line s-thin" cx="160" cy="136" rx="108" ry="46" />
    <g class="s-line s-thin s-faint">
      <path d="M52 118 H268" />
      <path d="M50 136 H270" />
      <path d="M54 154 H266" />
      <path d="M62 172 H258" />
    </g>
    <path
      v-for="(l, i) in witherLeaves"
      :key="`wl${i}`"
      class="s-leaf"
      :d="LEAF"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r})`"
    />
  </svg>
</template>
