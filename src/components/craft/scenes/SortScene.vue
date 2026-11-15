<script setup lang="ts">
import { computed } from 'vue'

import type { CraftForm, CraftSceneKey } from '@/catalog/craft/types'

import { LEAF } from './leaf'
import { arcPoint, clamp01, easeOut, window01 } from './scene-utils'

// 拣剔分级：竹筛轻摇，粗梗杂片挑出去，好茶分堆。
const props = defineProps<{ scene: CraftSceneKey; form?: CraftForm; progress: number }>()

const p = computed(() => clamp01(props.progress))
const beads = computed(() => props.form === 'bead')

const sieveLeaves = [
  { x: 96, y: 126, r: -18 },
  { x: 116, y: 118, r: 24 },
  { x: 138, y: 124, r: -6 },
  { x: 160, y: 132, r: 32 },
  { x: 102, y: 146, r: 12 },
  { x: 126, y: 142, r: -28 },
  { x: 150, y: 148, r: 18 },
  { x: 172, y: 142, r: -12 },
  { x: 112, y: 162, r: 26 },
  { x: 140, y: 164, r: -22 },
  { x: 162, y: 160, r: 8 },
]
const beadSpots = [
  { x: 98, y: 128 },
  { x: 120, y: 120 },
  { x: 142, y: 126 },
  { x: 164, y: 134 },
  { x: 104, y: 150 },
  { x: 128, y: 146 },
  { x: 152, y: 152 },
  { x: 174, y: 146 },
  { x: 116, y: 168 },
  { x: 144, y: 168 },
]

/** 被挑出去的粗梗 / 松碎茶珠：从左下角离开竹筛 */
const rejects: number[] = [1, 4, 8]
const rejectTargets = [
  { x: 44, y: 196 },
  { x: 56, y: 202 },
  { x: 36, y: 204 },
]

const rejected = computed(() =>
  rejects.map((idx, k) => {
    // 前半程就挑完，后半程只留下分好的堆，避免定格时看到半透明残影
    const t = easeOut(window01(p.value, 0.06 + k * 0.06, 0.36 + k * 0.06))
    const from = beads.value ? beadSpots[idx] : sieveLeaves[idx]
    const to = rejectTargets[k]
    const pos = arcPoint(from.x, from.y, to.x, to.y, t, 22)
    return { ...pos, t, k }
  }),
)

/** 被挑中的那几片，透明度随挑出的动作退去 */
function onSieveOpacity(index: number): number {
  const k = rejects.indexOf(index)
  if (k < 0) return beads.value ? 1 : 0.8
  return 1 - rejected.value[k].t
}

const goodPile = computed(() => 10 + p.value * 14)
const smallPile = computed(() => 7 + p.value * 9)
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <clipPath id="sortSieve">
        <ellipse cx="126" cy="142" rx="68" ry="42" />
      </clipPath>
    </defs>

    <!-- 竹筛在桌面上方轻轻摇，底下留一道影子，读起来是被端着的 -->
    <ellipse cx="126" cy="199" rx="74" ry="9" fill="#2f4f4f" opacity="0.09" />

    <!-- 竹筛：轻摇，但只晃一点，不让人看不清 -->
    <g :transform="`rotate(${Math.sin(p * Math.PI * 8) * 1.6} 126 142)`">
      <ellipse class="s-paper s-line" cx="126" cy="142" rx="76" ry="48" />
      <ellipse class="s-line s-thin" cx="126" cy="142" rx="68" ry="42" />
      <g clip-path="url(#sortSieve)" class="s-line s-thin s-faint">
        <path d="M62 126 Q126 134 190 126" />
        <path d="M58 142 Q126 150 194 142" />
        <path d="M62 158 Q126 166 190 158" />
        <path d="M92 104 Q98 142 92 180" />
        <path d="M126 100 Q132 142 126 184" />
        <path d="M160 104 Q166 142 160 180" />
      </g>

      <!-- 筛面上的好茶：叶片或茶珠 -->
      <template v-if="beads">
        <g
          v-for="(b, i) in beadSpots"
          :key="`b${i}`"
          :style="{ opacity: onSieveOpacity(i) }"
        >
          <circle class="s-tea" :cx="b.x" :cy="b.y" r="8" />
          <path class="s-line s-thin" :d="`M${b.x - 3} ${b.y} q3 -3 6 0`" opacity="0.45" />
        </g>
      </template>
      <template v-else>
        <path
          v-for="(l, i) in sieveLeaves"
          :key="`s${i}`"
          class="s-tea"
          :d="LEAF"
          :style="{ opacity: onSieveOpacity(i) }"
          :transform="`translate(${l.x} ${l.y}) rotate(${l.r}) scale(0.78)`"
        />
      </template>
    </g>

    <!-- 挑出去的粗梗 / 碎珠 -->
    <g v-for="r in rejected" :key="`r${r.k}`" :style="{ opacity: Math.min(1, (1 - r.t) * 2) }">
      <template v-if="beads">
        <ellipse class="s-tea" :cx="r.x" :cy="r.y" rx="7" ry="5" :transform="`rotate(${-24 + r.k * 18} ${r.x} ${r.y})`" />
      </template>
      <template v-else>
        <path
          class="s-line s-thin"
          :d="`M${r.x - 8} ${r.y} q8 -4 16 0`"
          stroke="#6b4226"
          stroke-width="1.6"
        />
        <path class="s-line s-thin" :d="`M${r.x - 10} ${r.y + 4} q10 3 20 -1`" stroke="#6b4226" />
      </template>
    </g>

    <!-- 挑出去的那一小堆：小竹盘先落位，梗片再堆进盘里 -->
    <path class="s-paper s-line s-thin" d="M26 196 h44 l-6 14 h-32 z" />
    <g :style="{ opacity: 0.25 + p * 0.6 }">
      <template v-if="beads">
        <ellipse class="s-tea" cx="44" cy="196" rx="8" ry="5" transform="rotate(-18 44 196)" />
        <ellipse class="s-tea" cx="56" cy="201" rx="7" ry="5" transform="rotate(14 56 201)" />
        <ellipse class="s-tea" cx="37" cy="202" rx="6" ry="4" transform="rotate(-8 37 202)" />
      </template>
      <template v-else>
        <path
          fill="#8a6a44"
          stroke="var(--o-ink)"
          stroke-width="1"
          d="M34 203 Q47 194 61 203 Z"
        />
        <path class="s-line s-thin" d="M38 198 q12 -4 22 -1" stroke="#6b4226" />
        <path class="s-line s-thin" d="M36 205 q10 -3 20 0" stroke="#6b4226" />
      </template>
    </g>

    <!-- 分出的两堆：落在右下的小竹匾上 -->
    <ellipse class="s-paper s-line s-thin" cx="246" cy="198" rx="48" ry="14" />
    <ellipse class="s-line s-thin s-faint" cx="246" cy="198" rx="38" ry="9" />
    <g :style="{ opacity: 0.55 + p * 0.4 }">
      <path
        fill="#8a6a44"
        stroke="var(--o-ink)"
        stroke-width="1.2"
        :d="`M208 198 Q230 ${198 - goodPile * 2} 252 198 Z`"
      />
      <path
        fill="#8a6a44"
        stroke="var(--o-ink)"
        stroke-width="1.2"
        :d="`M258 198 Q274 ${198 - smallPile * 2} 290 198 Z`"
      />
      <g class="s-line s-thin s-faint">
        <path d="M214 192 q16 -8 32 -2" />
        <path d="M262 194 q12 -5 24 -1" />
      </g>
    </g>

    <path class="s-line s-thin s-faint" d="M34 212 H292" />
  </svg>
</template>
