<script setup lang="ts">
import { computed } from 'vue'

import { LEAF } from './leaf'

// 杀青：锅里的叶子随抖炒翻动，火色与蒸汽一起上来
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))

const wokLeaves = [
  { x: 136, y: 128, r: -18 },
  { x: 166, y: 136, r: 24 },
  { x: 152, y: 118, r: 6 },
  { x: 182, y: 126, r: -30 },
  { x: 146, y: 144, r: 40 },
  { x: 172, y: 150, r: -12 },
]
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <radialGradient id="craftHeat" cx="50%" cy="60%" r="58%">
        <stop offset="0%" stop-color="#c07a34" stop-opacity="0.55" />
        <stop offset="55%" stop-color="#c07a34" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#c07a34" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 火：不画火苗，只画热度——锅底随按住的时间热起来 -->
    <ellipse class="s-paper s-line" cx="160" cy="112" rx="78" ry="17" />
    <path class="s-line s-wok" d="M82 112 C 86 158 234 158 238 112" />
    <path
      d="M82 112 C 86 158 234 158 238 112 Z"
      fill="url(#craftHeat)"
      :style="{ opacity: 0.25 + p * 0.75 }"
    />

    <!-- 茶叶：生绿随杀青转暗 -->
    <g :transform="`rotate(${p * 10} 160 128)`">
      <path
        v-for="(l, i) in wokLeaves"
        :key="`ll${i}`"
        class="s-leaf"
        :d="LEAF"
        :style="{ opacity: 1 - p }"
        :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.9)`"
      />
      <path
        v-for="(l, i) in wokLeaves"
        :key="`dl${i}`"
        class="s-leaf-dark"
        :d="LEAF"
        :style="{ opacity: p }"
        :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.9)`"
      />
    </g>

    <!-- 蒸汽 -->
    <g
      class="s-line s-thin"
      :style="{ opacity: p, transform: `translateY(${(1 - p) * 10}px)` }"
    >
      <path d="M132 100 C 124 88 140 80 132 66 C 126 54 138 48 134 38" />
      <path d="M160 94 C 152 82 168 74 160 60 C 154 48 166 42 162 32" />
      <path d="M190 100 C 182 88 198 80 190 66 C 184 54 196 48 192 38" />
    </g>

    <path class="s-line s-thin s-faint" d="M72 208 H248" />
  </svg>
</template>
