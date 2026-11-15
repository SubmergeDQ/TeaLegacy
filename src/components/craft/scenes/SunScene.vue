<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { LEAF } from './leaf'
import { clamp01 } from './scene-utils'

// 日光晒青：日头慢慢转，竹匾里的条索走水、收干。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const trayLeaves = [
  { x: 96, y: 146, r: -22 },
  { x: 128, y: 138, r: 16 },
  { x: 162, y: 132, r: -8 },
  { x: 196, y: 140, r: 28 },
  { x: 110, y: 168, r: 34 },
  { x: 146, y: 160, r: -30 },
  { x: 180, y: 166, r: 10 },
  { x: 210, y: 158, r: -18 },
  { x: 132, y: 184, r: 22 },
  { x: 170, y: 184, r: -14 },
]
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e6c98f" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#e6c98f" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 日头与光线 -->
    <circle cx="258" cy="58" r="48" fill="url(#sunGlow)" />
    <g :transform="`rotate(${p * 46} 258 58)`">
      <circle class="s-line s-thin" cx="258" cy="58" r="20" fill="#e6c98f" fill-opacity="0.32" />
      <g class="s-line s-thin">
        <path d="M258 28 v -9" />
        <path d="M258 88 v 9" />
        <path d="M228 58 h -9" />
        <path d="M288 58 h 9" />
        <path d="M237 37 l -6 -6" />
        <path d="M279 79 l 6 6" />
        <path d="M279 37 l 6 -6" />
        <path d="M237 79 l -6 6" />
      </g>
    </g>
    <g class="s-line s-thin" :style="{ opacity: 0.28 + p * 0.2 }">
      <path d="M236 82 L196 152" stroke-dasharray="4 7" />
      <path d="M226 74 L170 146" stroke-dasharray="4 7" />
      <path d="M244 94 L216 158" stroke-dasharray="4 7" />
    </g>

    <!-- 匾下的浅影：匾落在桌面上 -->
    <ellipse cx="146" cy="207" rx="94" ry="7" fill="#2f4f4f" opacity="0.06" />

    <!-- 竹匾 -->
    <ellipse class="s-paper s-line" cx="146" cy="160" rx="106" ry="46" />
    <ellipse class="s-line s-thin s-faint" cx="146" cy="160" rx="92" ry="37" />
    <g class="s-line s-thin s-faint">
      <path d="M46 148 H246" />
      <path d="M50 172 H242" />
    </g>

    <!-- 条索：晒到后面收干、微卷 -->
    <path
      v-for="(l, i) in trayLeaves"
      :key="`tl${i}`"
      class="s-leaf-dry"
      :d="LEAF"
      :style="{ opacity: 0.35 + p * 0.6 }"
      :transform="`translate(${l.x} ${l.y}) rotate(${l.r + p * 12 * (i % 2 ? 1 : -1)}) scale(${1 - p * 0.08})`"
    />

    <!-- 走掉的水气：让太阳与匾面自己说话，不再画没有归属的空心圆 -->

    <path class="s-line s-thin s-faint" d="M24 214 H296" />
  </svg>
</template>
