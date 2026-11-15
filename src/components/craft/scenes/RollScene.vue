<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 揉捻：竹席上的茶团随推揉收紧，条索一条条显出来。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))

const swayX = computed(() => Math.sin(p.value * Math.PI * 4) * 8)
const shrink = computed(() => 1 - p.value * 0.16)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 竹席：边框 + 竹条，席下留一道浅影 -->
    <ellipse cx="160" cy="196" rx="108" ry="6" fill="#2f4f4f" opacity="0.05" />
    <rect class="s-paper s-line" x="48" y="84" width="224" height="108" rx="10" />
    <rect class="s-line s-thin" x="56" y="92" width="208" height="92" rx="6" />
    <g class="s-line s-thin s-faint">
      <path d="M60 106 Q160 114 260 106" />
      <path d="M58 124 Q160 132 262 124" />
      <path d="M58 142 Q160 150 262 142" />
      <path d="M58 160 Q160 168 262 160" />
      <path d="M60 178 Q160 186 260 178" />
    </g>

    <!-- 茶团：随推揉左右走，体积收紧；动势交给茶团本身，不再在席上画散线 -->
    <g :transform="`translate(${swayX} 0) translate(160 140) scale(${shrink}) translate(-160 -140)`">
      <path
        class="s-tea-deep"
        d="M160 104 c 31 -3 51 15 52 35 c 1 21 -23 36 -54 36 c -31 0 -53 -15 -52 -36 c 1 -20 23 -32 54 -35 z"
      />
      <path
        class="s-line s-thin"
        d="M160 104 c 31 -3 51 15 52 35 c 1 21 -23 36 -54 36 c -31 0 -53 -15 -52 -36 c 1 -20 23 -32 54 -35 z"
        opacity="0.7"
      />

      <!-- 条索：越揉越清楚 -->
      <g class="s-line s-thin" :style="{ opacity: 0.3 + p * 0.55 }" stroke="#f3ecdc">
        <path d="M122 124 q20 -10 42 -6" />
        <path d="M126 144 q22 10 46 2" />
        <path d="M144 112 q14 8 26 3" />
        <path d="M134 160 q18 6 38 1" />
        <path d="M150 132 q16 -7 30 0" />
        <path d="M138 168 q20 4 40 -2" />
      </g>
      <g class="s-line s-thin" :style="{ opacity: 0.25 + p * 0.4 }" stroke="#3d2412">
        <path d="M128 134 q18 8 36 2" />
        <path d="M146 152 q16 -6 32 -1" />
        <path d="M142 168 q16 4 32 -1" />
      </g>
    </g>

    <!-- 动势交给茶团自己的左右推揉，席面上不再留无归属的弧线 -->

    <path class="s-line s-thin s-faint" d="M36 210 H284" />
  </svg>
</template>
