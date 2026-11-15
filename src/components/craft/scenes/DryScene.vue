<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 阴干：竹架上摊着刚成形的茶，风从一头穿到另一头。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const form = computed<CraftForm>(() => props.form ?? 'cake')

const topRow = computed(() => {
  const xs = form.value === 'bead' ? [84, 128, 172, 216] : [96, 148, 200]
  return xs.map((x) => ({ x, y: 122 }))
})

const bottomRow = computed(() => {
  const xs = form.value === 'bead' ? [84, 128, 172, 216] : [116, 180]
  return xs.map((x) => ({ x, y: 184 }))
})

const settling = computed(() => 1 - p.value * 0.03)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 一弯月：阴干不见日头；月亮避开架顶横梁 -->
    <path
      class="s-line s-thin"
      d="M246 20 a 16 16 0 1 0 11 24 a 12 12 0 1 1 -11 -24 z"
      fill="#e6c98f"
      fill-opacity="0.35"
    />

    <!-- 穿堂风在最底层：架子、器物都会把它挡住，不会压在茶面上 -->
    <g class="s-wind" :style="{ opacity: 0.18 + p * 0.4 }">
      <path class="s-line s-thin" d="M30 100 q40 -8 80 0 q40 8 80 0 q40 -8 80 0" stroke-dasharray="6 9" />
      <path class="s-line s-thin" d="M22 156 q40 -8 80 0 q40 8 80 0 q40 -8 80 0" stroke-dasharray="6 9" />
      <path class="s-line s-thin" d="M34 208 q40 -6 78 0 q40 8 80 0 q40 -6 78 0" stroke-dasharray="6 9" />
    </g>

    <!-- 竹架 -->
    <path class="s-line" d="M48 212 V 58 M272 212 V 58" />
    <path class="s-line s-thin" d="M44 58 H276" />
    <path class="s-paper s-line" d="M40 122 H280 V 130 H40 Z" />
    <path class="s-paper s-line" d="M40 184 H280 V 192 H40 Z" />
    <path class="s-line s-thin s-faint" d="M60 130 V 184 M260 130 V 184" />

    <!-- 架上成形的茶：按形态排开 -->
    <g
      v-for="(it, i) in topRow"
      :key="`t${i}`"
      :transform="`translate(${it.x} ${it.y - (1 - p) * 2}) scale(${settling})`"
    >
      <template v-if="form === 'bead'">
        <circle class="s-tea-deep s-tea-deep-solid" cy="-10" r="10" />
        <path class="s-line s-thin" d="M-4 -12 q4 -3 8 0" opacity="0.35" />
      </template>
      <template v-else-if="form === 'brick'">
        <rect class="s-tea s-tea-solid" x="-24" y="-21" width="48" height="21" rx="2" />
        <path class="s-line s-thin" d="M-16 -14 H16" opacity="0.35" />
      </template>
      <template v-else-if="form === 'cake'">
        <circle class="s-tea s-tea-solid" cy="-23" r="23" />
        <circle class="s-line s-thin" cy="-23" r="4" />
      </template>
      <template v-else>
        <path class="s-tea s-tea-solid" d="M-22 0 A 22 24 0 0 1 22 0 Z" />
        <ellipse class="s-paper s-line s-thin" cy="-15" rx="9" ry="3" />
      </template>
    </g>

    <g
      v-for="(it, i) in bottomRow"
      :key="`b${i}`"
      :transform="`translate(${it.x} ${it.y - (1 - p) * 2}) scale(${settling})`"
    >
      <template v-if="form === 'bead'">
        <circle class="s-tea-deep s-tea-deep-solid" cy="-10" r="10" />
        <path class="s-line s-thin" d="M-4 -12 q4 -3 8 0" opacity="0.35" />
      </template>
      <template v-else-if="form === 'brick'">
        <rect class="s-tea s-tea-solid" x="-24" y="-21" width="48" height="21" rx="2" />
        <path class="s-line s-thin" d="M-16 -14 H16" opacity="0.35" />
      </template>
      <template v-else-if="form === 'cake'">
        <circle class="s-tea s-tea-solid" cy="-23" r="23" />
        <circle class="s-line s-thin" cy="-23" r="4" />
      </template>
      <template v-else>
        <path class="s-tea s-tea-solid" d="M-22 0 A 22 24 0 0 1 22 0 Z" />
        <ellipse class="s-paper s-line s-thin" cy="-15" rx="9" ry="3" />
      </template>
    </g>

    <!-- 穿堂风已在茶品下层，这里不再重复 -->

    <path class="s-line s-thin s-faint" d="M28 216 H292" />
  </svg>
</template>
