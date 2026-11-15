<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { clamp01 } from './scene-utils'

// 压制：砖用平压，饼用石模，沱用轻压。压力都落在同一副木架上。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const form = computed<CraftForm>(() => props.form ?? 'cake')

const headY = computed(() => 60 + p.value * 74)
const cakeY = computed(() => 56 + p.value * 42)
const brickHeight = computed(() => 46 - p.value * 10)
const tuoScale = computed(() => 1 - p.value * 0.06)

/** 饼比砖、沱大一圈，桌面要落到更低的位置，饼才不会切进地面 */
const groundY = computed(() => (form.value === 'cake' ? 232 : 220))
/** 饼的石模更大，压架横梁要更高，石磨才不会顶穿横梁 */
const frameTop = computed(() => (form.value === 'cake' ? 16 : 36))
const discR = computed(() => (form.value === 'cake' ? 46 : 44))
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <!-- 压架：立柱与横梁 -->
    <path class="s-line" :d="`M58 ${groundY} V ${frameTop} M262 ${groundY} V ${frameTop}`" />
    <path class="s-line" :d="`M48 ${frameTop} H272`" />
    <path class="s-line s-thin s-faint" :d="`M58 ${frameTop + 12} H262`" />

    <!-- ================= 砖：方形模具 + 平压板 ================= -->
    <template v-if="form === 'brick'">
      <!-- 茶砖在模里被压实 -->
      <rect
        class="s-tea-deep"
        x="120"
        :y="196 - brickHeight"
        width="80"
        :height="brickHeight"
        rx="2"
      />
      <g class="s-line s-thin" opacity="0.35">
        <path d="M128 186 h 64" />
        <path d="M128 176 h 64" />
      </g>

      <!-- 模具边框 -->
      <path class="s-wood s-line" fill-rule="evenodd" d="M112 142 H208 V206 H112 Z M120 150 H200 V198 H120 Z" />
      <path class="s-line s-thin" d="M104 146 v 56 M216 146 v 56" />

      <!-- 模具落在木托上，木托再落到地面 -->
      <rect class="s-wood s-line s-thin" x="94" y="206" width="132" height="8" rx="2" />
      <rect class="s-wood s-line s-thin" x="100" y="214" width="8" height="6" rx="1" />
      <rect class="s-wood s-line s-thin" x="212" y="214" width="8" height="6" rx="1" />

      <!-- 压板与石重：石重直接坐在压板上 -->
      <rect class="s-wood s-line" x="106" :y="headY" width="108" height="16" rx="2" />
      <rect class="s-paper s-line s-thin" x="120" :y="headY - 24" width="80" height="24" rx="3" />
      <path class="s-line s-thin s-faint" :d="`M130 ${headY - 16} h 60`" />
      <path class="s-line s-thin s-faint" :d="`M160 36 V ${headY - 24}`" />

      <!-- 受力线 -->
      <g class="s-line s-thin" :style="{ opacity: 0.2 + p * 0.5 }">
        <path d="M96 158 l -10 6 M96 174 l -10 6 M96 190 l -10 6" />
        <path d="M224 158 l 10 6 M224 174 l 10 6 M224 190 l 10 6" />
      </g>
    </template>

    <!-- ================= 饼：石模压圆饼 ================= -->
    <template v-else-if="form === 'cake'">
      <!-- 布袋里揉好的圆坨，随压力收紧；饼身做实，避免透出布袋的重影 -->
      <ellipse cx="160" cy="182" rx="60" ry="28" fill="#c9b48c" fill-opacity="0.28" />
      <ellipse cx="160" cy="230" rx="64" ry="6" fill="#2f4f4f" opacity="0.07" />
      <g :transform="`translate(160 176) scale(${1 + p * 0.03} ${1 - p * 0.1}) translate(-160 -176)`">
        <circle fill="#8a6a44" fill-opacity="0.9" stroke="var(--o-ink)" stroke-width="1.2" cx="160" cy="176" r="54" />
        <circle class="s-line s-thin" cx="160" cy="176" r="8" />
        <g class="s-line s-thin s-faint">
          <path d="M116 160 q18 -8 38 -4" />
          <path d="M170 194 q20 -4 32 -14" />
          <path d="M120 192 q18 8 38 4" />
        </g>
      </g>

      <!-- 石磨：落下来，压出饼形 -->
      <g :style="{ opacity: 0.95 }">
        <circle class="s-paper s-line" cx="160" :cy="cakeY" :r="discR" />
        <circle class="s-line s-thin" cx="160" :cy="cakeY" r="8" />
        <circle class="s-line s-thin s-faint" cx="160" :cy="cakeY" r="27" />
        <path class="s-line s-thin" :d="`M160 ${cakeY - discR} v -10`" />
        <path class="s-line s-thin" :d="`M146 ${cakeY - discR - 10} h 28`" />
      </g>
      <path class="s-line s-thin s-faint" :d="`M160 ${frameTop} V ${cakeY - discR}`" />

      <!-- 受压后冒出的水气 -->
      <g class="s-line s-thin" :style="{ opacity: 0.45 * p, transform: `translateY(${(1 - p) * 8}px)` }">
        <path d="M112 160 C 104 148 118 140 112 126" />
        <path d="M208 160 C 200 148 214 140 208 126" />
      </g>
    </template>

    <!-- ================= 沱：碗臼形，轻压定型 ================= -->
    <template v-else>
      <!-- 木托先画，沱身压在上面，底边不会被托面横切 -->
      <rect class="s-wood s-line s-thin" x="88" y="196" width="144" height="8" rx="2" />
      <rect class="s-wood s-line s-thin" x="100" y="204" width="8" height="16" rx="1" />
      <rect class="s-wood s-line s-thin" x="212" y="204" width="8" height="16" rx="1" />

      <g :transform="`translate(160 196) scale(1 ${tuoScale}) translate(-160 -196)`">
        <path class="s-tea" d="M96 196 A 64 56 0 0 1 224 196 Z" />
        <ellipse class="s-paper s-line s-thin" cx="160" cy="146" rx="31" ry="9" />
        <ellipse class="s-line s-thin s-faint" cx="160" cy="146" rx="9" ry="3" />
        <path class="s-line s-thin s-faint" d="M112 184 q22 -8 44 -4" />
        <path class="s-line s-thin s-faint" d="M168 188 q22 2 38 -8" />
      </g>

      <!-- 压头：一块弧形木模 -->
      <g :transform="`translate(0 ${p * 28})`">
        <path class="s-wood s-line" d="M124 100 q36 -22 72 0 q-4 18 -36 18 q-32 0 -36 -18 z" />
        <path class="s-paper s-line s-thin" d="M136 74 h48 v 14 h-48 z" />
        <path class="s-line s-thin s-faint" :d="`M160 ${frameTop} V ${74 + p * 28}`" />
      </g>

      <g class="s-line s-thin" :style="{ opacity: 0.2 + p * 0.5 }">
        <path d="M88 184 l -10 4 M88 196 l -10 4 M232 184 l 10 4 M232 196 l 10 4" />
      </g>
    </template>

    <path class="s-line s-thin s-faint" :d="`M34 ${groundY} H286`" />
  </svg>
</template>
