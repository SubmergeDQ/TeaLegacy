<script setup lang="ts">
import { computed, useId } from 'vue'

// 7 日趋势折线（自绘 SVG，0 依赖）
// 拉伸到容器宽，但线宽用 non-scaling-stroke 保持 1.5px；
// 面积是墨绿渐变，越靠近底线越淡。
const props = withDefaults(
  defineProps<{
    points: { label: string; value: number }[]
    height?: string
    tone?: 'ink' | 'primary'
  }>(),
  { height: '7rem', tone: 'ink' },
)

const W = 320
const H = 120
const TOP = 10
const BOTTOM = 8

const maxValue = computed(() => Math.max(1, ...props.points.map((p) => p.value)))

const coords = computed(() => {
  const count = props.points.length
  return props.points.map((point, index) => ({
    x: count <= 1 ? W / 2 : (index / (count - 1)) * W,
    y: H - BOTTOM - (point.value / maxValue.value) * (H - TOP - BOTTOM),
  }))
})

const linePath = computed(() =>
  coords.value
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' '),
)

const areaPath = computed(() => {
  if (coords.value.length === 0) return ''
  return `${linePath.value} L${W} ${H} L0 ${H} Z`
})

const strokeColor = computed(() => (props.tone === 'primary' ? '#6b4226' : '#2f4f4f'))
const gradientId = `o-line-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
</script>

<template>
  <div class="o-line">
    <svg
      class="o-line__svg"
      :style="{ height }"
      viewBox="0 0 320 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.16" />
          <stop offset="100%" :stop-color="strokeColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line
        v-for="ratio in [0.25, 0.5, 0.75]"
        :key="ratio"
        class="o-line__grid"
        x1="0"
        :x2="W"
        :y1="H * ratio"
        :y2="H * ratio"
        vector-effect="non-scaling-stroke"
      />

      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <path
        :d="linePath"
        class="o-line__path"
        :style="{ stroke: strokeColor }"
        fill="none"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <div class="o-line__labels" aria-hidden="true">
      <span v-for="point in points" :key="point.label">{{ point.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.o-line {
  display: grid;
  gap: 0.375rem;
}

.o-line__svg {
  display: block;
  width: 100%;
  overflow: visible;
}

.o-line__grid {
  stroke: var(--o-line);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.o-line__path {
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.o-line__labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}
</style>
