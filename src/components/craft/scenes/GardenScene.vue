<script setup lang="ts">
import { computed } from 'vue'

import { LEAF } from './leaf'

// 采青：六片叶逐次离枝，落入竹篓
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))

const gardenLeaves = [
  { x: 123, y: 96, r: -32 },
  { x: 110, y: 122, r: -150 },
  { x: 99, y: 147, r: 27 },
  { x: 90, y: 169, r: -153 },
  { x: 83, y: 190, r: 25 },
  { x: 79, y: 207, r: -148 },
]
const picked = computed(() => Math.round(p.value * gardenLeaves.length))
const basketLeaves = [
  { x: 236, y: 190, r: -18 },
  { x: 254, y: 194, r: 22 },
  { x: 244, y: 180, r: 6 },
  { x: 262, y: 184, r: -28 },
  { x: 230, y: 178, r: 42 },
  { x: 256, y: 200, r: -8 },
  { x: 240, y: 200, r: 16 },
  { x: 268, y: 196, r: 34 },
]
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <path class="s-line" d="M74 214 C 88 176 104 126 144 56" />

    <!-- 枝头的芽 -->
    <path class="s-leaf" d="M144 56 C 152 49 161 51 163 60 C 155 65 146 63 144 56 Z" />

    <path
      v-for="(l, i) in gardenLeaves"
      :key="`gl${i}`"
      class="s-leaf"
      :d="LEAF"
      :style="{ opacity: i < picked ? 0 : 1 }"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r})`"
    />

    <!-- 竹篓 -->
    <path class="s-line s-thin" d="M216 152 a 30 30 0 0 1 60 0" />
    <path class="s-paper s-line" d="M204 152 h84 l-9 42 a 12 12 0 0 1 -12 10 h-42 a 12 12 0 0 1 -12 -10 z" />
    <path class="s-line s-thin" d="M206 166 h80 M209 180 h74" />
    <path
      v-for="(l, i) in basketLeaves"
      :key="`bl${i}`"
      class="s-leaf"
      :d="LEAF"
      :style="{ opacity: i < picked - 1 ? 0.92 : 0 }"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.78)`"
    />
  </svg>
</template>
