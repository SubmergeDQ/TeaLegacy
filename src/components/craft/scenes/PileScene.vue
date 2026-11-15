<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 渥堆与摊晾：同一堆茶，先堆起来发酵，再开沟摊薄散堆味。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const spreading = computed(() => props.scene === 'spread')

const pileHeight = computed(() => 28 + p.value * 54)
const halfWidth = computed(() => (spreading.value ? 64 + p.value * 52 : 96))
const spreadHeight = computed(() => 86 - p.value * 62)

const pilePath = computed(() => {
  if (!spreading.value) {
    return `M64 202 Q160 ${202 - pileHeight.value * 2} 256 202 Z`
  }
  return `M${160 - halfWidth.value} 202 Q160 ${202 - spreadHeight.value * 2} ${160 + halfWidth.value} 202 Z`
})

const steam = computed(() => (spreading.value ? 0.7 * (1 - p.value) : 0.35 + p.value * 0.45))
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="pileWarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c07a34" stop-opacity="0.42" />
        <stop offset="100%" stop-color="#6b4226" stop-opacity="0.24" />
      </linearGradient>
      <clipPath id="pileClip">
        <path :d="pilePath" />
      </clipPath>
    </defs>

    <!-- 茶堆 -->
    <path :d="pilePath" fill="url(#pileWarm)" stroke="var(--o-ink)" stroke-width="1.4" />

    <!-- 堆面纹理：统一裁在堆形以内，堆矮时不会浮在半空 -->
    <g clip-path="url(#pileClip)" class="s-line s-thin" :style="{ opacity: spreading ? 0.3 : 0.5 }">
      <path d="M96 190 q26 -14 54 -8" />
      <path d="M148 184 q30 10 62 0" />
      <path d="M116 174 q22 -10 44 -4" />
      <path d="M172 172 q24 8 44 -2" />
      <path d="M124 156 q22 -8 44 -2" />
      <path d="M166 150 q20 6 36 0" />
      <path d="M140 136 q18 -6 36 -1" />
    </g>

    <!-- 翻堆的动作交给热气与堆形的变化，不再让木耙斜着悬在半空 -->

    <!-- 发酵的热气 -->
    <g
      class="s-line s-thin"
      :style="{ opacity: steam, transform: `translateY(${(1 - p) * 8}px)` }"
    >
      <path d="M118 150 C 110 138 124 130 118 116" />
      <path d="M160 134 C 152 122 166 114 160 100" />
      <path d="M202 150 C 194 138 208 130 202 116" />
    </g>

    <!-- 堆心的微生物活动：摊开后就不画了，避免浮在扁堆外 -->
    <g v-if="!spreading" fill="#c07a34" :style="{ opacity: 0.2 + p * 0.5 }">
      <circle cx="132" cy="182" r="2" />
      <circle cx="158" cy="172" r="2.4" />
      <circle cx="188" cy="180" r="2" />
      <circle cx="172" cy="192" r="1.8" />
    </g>

    <path class="s-line s-thin s-faint" d="M28 204 H292" />
  </svg>
</template>
