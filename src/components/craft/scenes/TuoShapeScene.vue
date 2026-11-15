<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 捏制塑形：茶团在布里被收成上圆下凹的碗臼状。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const halfW = computed(() => 66 - p.value * 4)
const height = computed(() => 44 + p.value * 16)
const top = computed(() => 198 - height.value)
const hollowRx = computed(() => 18 + p.value * 13)
const hollowRy = computed(() => 3 + p.value * 7)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 布垫 -->
    <ellipse class="s-cloth s-line" cx="160" cy="200" rx="80" ry="16" />
    <path class="s-line s-thin s-faint" d="M92 204 q34 10 68 2 q34 -8 68 0" />
    <path class="s-line s-thin s-faint" d="M104 212 q28 8 56 0 q28 -8 56 0" />

    <!-- 沱身：上圆下凹；用实色，布垫的褶线不会透到沱面上 -->
    <path
      class="s-tea s-tea-solid"
      :d="`M${160 - halfW} 198 A ${halfW} ${height} 0 0 1 ${160 + halfW} 198 Z`"
    />
    <path
      class="s-line s-thin"
      :d="`M${160 - halfW} 198 A ${halfW} ${height} 0 0 1 ${160 + halfW} 198`"
      :style="{ opacity: 0.65 }"
    />

    <!-- 顶窝：随捏制慢慢凹下去 -->
    <ellipse
      class="s-paper s-line s-thin"
      cx="160"
      :cy="top + 8"
      :rx="hollowRx"
      :ry="hollowRy"
    />
    <ellipse
      :cx="160"
      :cy="top + 9"
      :rx="hollowRx * 0.55"
      :ry="hollowRy * 0.5"
      fill="#6b4226"
      fill-opacity="0.22"
    />

    <!-- 条索纹理 -->
    <g class="s-line s-thin" :style="{ opacity: 0.2 + p * 0.35 }">
      <path :d="`M${160 - halfW + 16} 190 q20 -8 42 -4`" />
      <path :d="`M${160 + 6} 194 q20 4 38 -4`" />
      <path :d="`M${160 - 28} 178 q14 -6 28 -2`" />
    </g>

    <!-- 捏形靠沱身自己的收放，四周不再画没有归属的手势弧 -->

    <!-- 布褶：被茶汁浸出的一点深色 -->
    <g class="s-line s-thin s-faint">
      <path d="M116 202 q18 8 40 4" />
      <path d="M166 208 q20 0 38 -6" />
    </g>

    <path class="s-line s-thin s-faint" d="M28 218 H292" />
  </svg>
</template>
