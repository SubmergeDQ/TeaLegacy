<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { LEAF } from './leaf'
import { clamp01 } from './scene-utils'

// 杀青：铁锅里的叶片随抖炒翻动，火色与蒸汽一起上来。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const wokLeaves = [
  { x: 132, y: 132, r: -18 },
  { x: 154, y: 126, r: 24 },
  { x: 176, y: 132, r: -6 },
  { x: 194, y: 140, r: 30 },
  { x: 142, y: 148, r: 40 },
  { x: 166, y: 152, r: -12 },
  { x: 188, y: 154, r: 62 },
  { x: 120, y: 142, r: 8 },
  { x: 160, y: 140, r: 18 },
  { x: 206, y: 132, r: -32 },
]

/** 每片叶子按自己的相位翻动，看起来是"抖炒"而不是整锅平移 */
const tumbled = computed(() =>
  wokLeaves.map((l, i) => ({
    x: l.x + Math.sin(p.value * Math.PI * 5 + i * 1.7) * 5,
    y: l.y + Math.cos(p.value * Math.PI * 4 + i * 1.3) * 3,
    r: l.r + Math.sin(p.value * Math.PI * 6 + i) * 9,
  })),
)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <radialGradient id="wokHeat" cx="50%" cy="60%" r="62%">
        <stop offset="0%" stop-color="#c07a34" stop-opacity="0.6" />
        <stop offset="55%" stop-color="#c07a34" stop-opacity="0.24" />
        <stop offset="100%" stop-color="#c07a34" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="wokCoals" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c07a34" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#c07a34" stop-opacity="0" />
      </radialGradient>
      <!-- 锅里的叶子统一裁在锅形以内，翻炒时不会飘到锅外 -->
      <clipPath id="wokLeafClip">
        <path d="M80 114 C 84 172 236 172 240 114 Z" />
      </clipPath>
    </defs>

    <!-- 灶火：一层暖光，火苗从炭床升起、中间一簇舔到锅底 -->
    <ellipse cx="160" cy="190" rx="58" ry="15" fill="url(#wokCoals)" :style="{ opacity: 0.35 + p * 0.55 }" />
    <ellipse cx="160" cy="199" rx="34" ry="5" fill="#c07a34" :style="{ opacity: 0.16 + p * 0.2 }" />
    <g class="s-line s-thin" fill="#c07a34" fill-opacity="0.16" :style="{ opacity: 0.3 + p * 0.55 }">
      <path d="M150 198 q-9 -21 0 -42 q9 20 0 42 z" />
      <path d="M160 199 q-11 -22 0 -44 q11 20 0 44 z" />
      <path d="M170 198 q-9 -21 0 -42 q9 20 0 42 z" />
    </g>

    <!-- 锅沿与锅身 -->
    <ellipse class="s-paper s-line" cx="160" cy="114" rx="80" ry="17" />
    <path class="s-wok" d="M80 114 C 84 172 236 172 240 114" />

    <!-- 锅里的热度：随按住的时间变浓 -->
    <path
      d="M80 114 C 84 172 236 172 240 114 Z"
      fill="url(#wokHeat)"
      :style="{ opacity: 0.3 + p * 0.7 }"
    />

    <!-- 茶叶：生绿随杀青转暗 -->
    <g clip-path="url(#wokLeafClip)">
      <g :transform="`translate(0 ${Math.sin(p * Math.PI * 2) * 2})`">
        <path
          v-for="(l, i) in tumbled"
          :key="`fresh${i}`"
          class="s-leaf"
          :d="LEAF"
          :style="{ opacity: 1 - p }"
          :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.92)`"
        />
        <path
          v-for="(l, i) in tumbled"
          :key="`dark${i}`"
          class="s-leaf-dark"
          :d="LEAF"
          :style="{ opacity: p }"
          :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.92)`"
        />
      </g>
    </g>

    <!-- 竹铲：柄一直插进铲头里，翻转时不会看到一截浮着的木片 -->
    <g :transform="`rotate(${-8 + p * 16} 58 66)`">
      <path class="s-line s-thin" d="M58 66 L118 124" />
      <path class="s-wood s-line" d="M108 116 Q132 120 146 134 Q138 150 120 148 Q104 142 100 130 Z" />
      <path class="s-line s-thin s-faint" d="M112 126 q14 4 24 10 M106 132 q12 6 20 12" />
    </g>

    <!-- 蒸汽：从锅口内起笔 -->
    <g
      class="s-line s-thin"
      :style="{ opacity: 0.65 * p, transform: `translateY(${12 + (1 - p) * 10}px)` }"
    >
      <path d="M128 100 C 120 88 136 80 128 66 C 122 54 134 48 130 38" />
      <path d="M156 94 C 148 82 164 74 156 60 C 150 48 162 42 158 32" />
      <path d="M184 94 C 176 82 192 74 184 60 C 178 48 190 42 186 32" />
      <path d="M210 102 C 202 90 218 82 210 68 C 204 56 216 50 212 40" />
    </g>

    <!-- 灶台 -->
    <path class="s-line s-thin s-faint" d="M54 200 H266" />
  </svg>
</template>
