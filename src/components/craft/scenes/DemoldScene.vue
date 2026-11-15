<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 脱模：砖与沱是开模，饼是解袋。都是把成形的那一下露出来。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const form = computed<CraftForm>(() => props.form ?? 'brick')
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- ================= 砖：左右开模，上盖提起 ================= -->
    <template v-if="form === 'brick'">
      <!-- 茶砖 -->
      <rect class="s-tea-deep" x="118" y="152" width="84" height="46" rx="2" />
      <g class="s-line s-thin" opacity="0.35">
        <path d="M126 166 h 68" />
        <path d="M126 178 h 68" />
        <path d="M126 190 h 68" />
      </g>

      <!-- 上盖提起 -->
      <rect
        class="s-wood s-line"
        x="106"
        :y="142 - p * 34"
        width="108"
        height="10"
        rx="2"
      />

      <!-- 左右模壁分开 -->
      <rect class="s-wood s-line" :x="98 - p * 34" y="152" width="22" height="56" rx="2" />
      <rect class="s-wood s-line" :x="200 + p * 34" y="152" width="22" height="56" rx="2" />

      <!-- 砖落在底板上，不悬空 -->
      <rect class="s-wood s-line" x="96" y="198" width="128" height="14" rx="2" />

      <!-- 开模的松动线：跟着模壁一起往外走 -->
      <g class="s-line s-thin" :style="{ opacity: 0.15 + p * 0.55 }">
        <path :d="`M${96 - p * 34} 164 l -14 -2`" />
        <path :d="`M${96 - p * 34} 180 l -14 0`" />
        <path :d="`M${224 + p * 34} 164 l 14 -2`" />
        <path :d="`M${224 + p * 34} 180 l 14 0`" />
      </g>

      <path class="s-line s-thin s-faint" d="M38 212 H282" />
    </template>

    <!-- ================= 饼：解袋，露出饼形 ================= -->
    <template v-else-if="form === 'cake'">
      <!-- 圆饼：做实，避免布袋四角透成重影 -->
      <ellipse cx="160" cy="230" rx="64" ry="6" fill="#2f4f4f" opacity="0.07" />
      <circle fill="#8a6a44" fill-opacity="0.9" stroke="var(--o-ink)" stroke-width="1.2" cx="160" cy="176" r="54" />
      <circle class="s-line s-thin" cx="160" cy="176" r="8" />
      <g class="s-line s-thin s-faint">
        <path d="M118 160 q18 -8 38 -4" />
        <path d="M168 194 q20 -4 32 -14" />
        <path d="M120 190 q18 8 38 4" />
      </g>

      <!-- 布袋：一路提起，过半后淡出，避免半途变成透明泡泡 -->
      <g
        :style="{ opacity: p < 0.3 ? 1 : Math.max(0, (0.8 - p) / 0.5) }"
        :transform="`translate(0 ${-p * 150})`"
      >
        <path class="s-cloth" d="M108 176 Q110 130 160 126 Q210 130 212 176 Q186 204 160 204 Q134 204 108 176 Z" />
        <g class="s-line s-thin" opacity="0.4">
          <path d="M126 152 q34 -10 68 0" />
          <path d="M124 176 q36 10 72 0" />
          <path d="M146 132 q14 70 0 68" />
        </g>
        <path class="s-line s-thin" d="M160 126 q-8 -14 6 -18 q14 4 6 18" />
      </g>

      <path class="s-line s-thin s-faint" d="M38 232 H282" />
    </template>

    <!-- ================= 沱：左右脱模，露出碗臼 ================= -->
    <template v-else>
      <!-- 沱身 -->
      <path class="s-tea" d="M98 198 A 62 54 0 0 1 222 198 Z" />
      <ellipse class="s-paper s-line s-thin" cx="160" cy="150" rx="30" ry="9" />
      <ellipse class="s-line s-thin s-faint" cx="160" cy="150" rx="9" ry="3" />

      <!-- 上方模盖提起 -->
      <path
        class="s-wood s-line"
        d="M124 136 q36 -20 72 0 q-4 12 -36 12 q-32 0 -36 -12 z"
        :transform="`translate(0 ${-p * 38})`"
      />
      <path class="s-line s-thin s-faint" :d="`M132 ${124 - p * 38} h 56`" />

      <!-- 左右模壁分开 -->
      <rect class="s-wood s-line" :x="98 - p * 30" y="146" width="20" height="56" rx="2" />
      <rect class="s-wood s-line" :x="202 + p * 30" y="146" width="20" height="56" rx="2" />

      <g class="s-line s-thin" :style="{ opacity: 0.15 + p * 0.55 }">
        <path d="M84 160 l -14 -2" />
        <path d="M84 180 l -14 0" />
        <path d="M236 160 l 14 -2" />
        <path d="M236 180 l 14 0" />
      </g>

      <path class="s-line s-thin s-faint" d="M38 214 H282" />
    </template>
  </svg>
</template>
