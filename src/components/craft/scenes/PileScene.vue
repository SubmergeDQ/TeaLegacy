<script setup lang="ts">
import { computed } from 'vue'

// 渥堆：茶堆随发酵升高，翻堆时散开
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))
const pileHeight = computed(() => 26 + p.value * 54)
const turning = computed(() => props.step === 'turn')
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <path
      class="s-line s-tea-wash"
      :d="`M64 200 Q160 ${200 - pileHeight * 2} 256 200 Z`"
    />
    <path
      class="s-line s-thin"
      :d="`M64 200 Q160 ${200 - pileHeight * 2} 256 200`"
      stroke="#6b4226"
      stroke-opacity="0.5"
    />

    <!-- 棉布搭在堆上 -->
    <path class="s-dash" :d="`M86 196 Q160 ${186 - pileHeight * 1.5} 234 196`" />

    <g class="s-line s-thin" :style="{ opacity: 0.25 + p * 0.5 }">
      <path d="M112 96 C 104 86 118 80 112 68" />
      <path d="M160 86 C 152 76 166 70 160 58" />
      <path d="M208 96 C 200 86 214 80 208 68" />
    </g>

    <g v-if="turning" class="s-line s-thin" :style="{ opacity: p }">
      <path d="M78 146 a 82 58 0 0 1 164 0" />
      <path d="M242 136 l 10 10 l -16 4" />
    </g>

    <path class="s-line s-thin s-faint" d="M44 202 H276" />
  </svg>
</template>
