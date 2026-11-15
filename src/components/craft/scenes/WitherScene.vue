<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { LEAF } from './leaf'
import { clamp01, easeOut, lerp } from './scene-utils'

// 摊凉萎凋：一捧鲜叶向四面摊开，表层水汽慢慢散掉。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => easeOut(clamp01(props.progress)))

const targets = [
  { x: 86, y: 122, r: -22, sx: -6, sy: -4 },
  { x: 118, y: 110, r: 16, sx: 4, sy: -8 },
  { x: 154, y: 106, r: -8, sx: 8, sy: 2 },
  { x: 192, y: 112, r: 28, sx: -4, sy: 6 },
  { x: 226, y: 126, r: -34, sx: 6, sy: -2 },
  { x: 102, y: 144, r: 12, sx: -8, sy: 4 },
  { x: 140, y: 138, r: -18, sx: 2, sy: -6 },
  { x: 178, y: 142, r: 22, sx: -6, sy: 8 },
  { x: 214, y: 152, r: -12, sx: 8, sy: -4 },
  { x: 114, y: 168, r: 26, sx: -2, sy: 6 },
  { x: 154, y: 170, r: -26, sx: 6, sy: -2 },
  { x: 192, y: 166, r: 8, sx: -8, sy: 4 },
]

const leaves = computed(() =>
  targets.map((t) => ({
    x: lerp(160 + t.sx * 2.2, t.x, p.value),
    y: lerp(140 + t.sy * 2.2, t.y, p.value),
    r: lerp(t.r * 2.4, t.r, p.value),
  })),
)

const vapor = [
  { x: 108, y: 106, d: 'M108 108 C 102 98 112 92 108 82' },
  { x: 148, y: 94, d: 'M148 96 C 142 86 152 80 148 68' },
  { x: 186, y: 106, d: 'M186 108 C 180 98 190 92 186 80' },
  { x: 222, y: 120, d: 'M222 122 C 216 112 226 106 222 94' },
]
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 匾下留一道浅影，匾是落在桌面上的 -->
    <ellipse cx="160" cy="199" rx="106" ry="7" fill="#2f4f4f" opacity="0.06" />
    <!-- 竹筛 -->
    <ellipse class="s-paper s-line" cx="160" cy="144" rx="118" ry="52" />
    <ellipse class="s-line s-thin" cx="160" cy="144" rx="106" ry="44" />
    <g class="s-line s-thin s-faint">
      <path d="M66 124 Q160 134 254 124" />
      <path d="M56 144 Q160 154 264 144" />
      <path d="M66 164 Q160 174 254 164" />
      <path d="M108 182 Q160 190 212 182" />
    </g>

    <!-- 摊开的叶片 -->
    <path
      v-for="(l, i) in leaves"
      :key="`wl${i}`"
      class="s-leaf"
      :d="LEAF"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.9)`"
    />

    <!-- 散掉的水汽 -->
    <g
      class="s-line s-thin"
      :style="{ opacity: 0.5 * (1 - p), transform: `translateY(${p * -12}px)` }"
    >
      <path v-for="(v, i) in vapor" :key="`v${i}`" :d="v.d" />
    </g>

    <!-- 水汽已让匾面与叶片的姿态说话，不再补一道悬空的虚线 -->

    <path class="s-line s-thin s-faint" d="M24 206 H296" />
  </svg>
</template>
