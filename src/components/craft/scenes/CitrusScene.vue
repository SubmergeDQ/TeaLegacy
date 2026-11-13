<script setup lang="ts">
import { computed } from 'vue'

// 柑果：选果 / 开盖 / 挖果 / 填茶，同一颗果分四步变化
const props = defineProps<{ progress: number; step: string }>()

const p = computed(() => Math.min(1, Math.max(0, props.progress)))

// 选果时的三颗小果
const citrusPicks = [96, 160, 224]
const pickedFruit = computed(() => Math.round(p.value * 3))
/** 填茶时果肉已经挖净，不该跟着进度条回到没挖的样子 */
const hollow = computed(() => props.step === 'fill')
</script>

<template>
  <svg class="scene" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <template v-if="step === 'pick'">
      <g v-for="(fx, i) in citrusPicks" :key="`f${i}`">
        <circle
          class="s-leaf"
          :cx="fx"
          cy="148"
          r="36"
          :style="{
            opacity: i < pickedFruit ? 1 : 0.5,
            transform: i < pickedFruit ? 'translateY(-8px)' : 'none',
          }"
        />
        <path
          class="s-line s-thin"
          :d="`M${fx} 112 q10 -14 24 -16`"
          :style="{ opacity: i < pickedFruit ? 1 : 0.35 }"
        />
        <circle
          v-if="i < pickedFruit"
          class="s-line s-thin"
          :cx="fx"
          cy="148"
          r="44"
          stroke-dasharray="3 6"
        />
      </g>
    </template>

    <template v-else>
      <circle class="s-leaf" cx="160" cy="150" r="62" />
      <g fill="#2f4f4f" opacity="0.16">
        <circle cx="130" cy="166" r="2" />
        <circle cx="146" cy="186" r="2.2" />
        <circle cx="172" cy="190" r="2" />
        <circle cx="192" cy="172" r="2.2" />
        <circle cx="202" cy="152" r="2" />
      </g>

      <!-- 果柄与叶 -->
      <path class="s-line s-thin" d="M160 92 v -12" />
      <path class="s-leaf" d="M162 82 C 176 66 194 62 204 64 C 198 80 180 86 162 82 Z" />

      <!-- 开盖：切口随拖动画出 -->
      <ellipse class="s-paper s-line" cx="160" cy="114" rx="42" ry="12" />
      <path
        class="s-line s-thin"
        d="M118 114 a 42 12 0 0 1 84 0"
        :stroke-dasharray="140"
        :stroke-dashoffset="140 - p * 140"
        stroke="#6b4226"
      />

      <!-- 挖果：果肉退去，留下空壳 -->
      <ellipse
        cx="160"
        cy="154"
        rx="36"
        ry="26"
        fill="#c9b48c"
        :opacity="hollow ? 0 : 0.5 * (1 - p)"
      />
      <ellipse
        cx="160"
        cy="116"
        rx="36"
        ry="9"
        fill="#f5eede"
        :opacity="hollow ? 0.9 : 0.9 * p"
      />

      <!-- 填茶：茶从上方落下，填满壳 -->
      <g v-if="step === 'fill'">
        <g class="s-line s-thin" :style="{ opacity: 1 - p }">
          <path d="M160 56 v 24" />
          <path d="M154 70 l 6 8 l 6 -8" />
        </g>
        <ellipse
          cx="160"
          cy="116"
          rx="34"
          ry="8"
          fill="#7a4a28"
          :opacity="p"
          style="transition: opacity 420ms var(--o-ease-flow)"
        />
      </g>
    </template>
  </svg>
</template>
