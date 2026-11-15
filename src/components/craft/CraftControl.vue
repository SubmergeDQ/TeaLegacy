<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { CraftAction } from '@/catalog/craft/types'

// ============================================================
// 一步一动作：连续轻点 / 按住不放，两种手感共用一条同宽的控制条。
// 进度只上报 0–1，场景据此变化；完成后 emit done，由页面推进下一步。
// 进度不因松手清零——做茶是可以慢慢来的，不该因为手抖从头开始。
// ============================================================

const props = defineProps<{ action: CraftAction }>()

const emit = defineEmits<{
  'update:progress': [value: number]
  done: []
}>()

const type = computed(() => props.action.type)
const target = computed(() => Math.max(1, props.action.target))

const count = ref(0)
const ratio = ref(0)
const holding = ref(false)

const done = computed(() => ratio.value >= 1)

const valueText = computed(() => {
  if (done.value) return '完成'
  if (type.value === 'hold') return `${Math.round(ratio.value * 100)}%`
  return `${count.value} / ${target.value}`
})

const hint = computed(() =>
  type.value === 'hold' ? '按住画面或按钮，直到走完' : '轻点画面或按钮',
)

let raf = 0
let lastTime = 0

function report() {
  emit('update:progress', ratio.value)
}

function settle() {
  ratio.value = 1
  report()
  emit('done')
}

// —— 连续轻点 ——
function oneTap() {
  if (done.value) return
  count.value += 1
  ratio.value = Math.min(1, count.value / target.value)
  report()
  if (count.value >= target.value) settle()
}

function onClick() {
  if (type.value === 'tap') oneTap()
}

// —— 按住 ——
function startHold() {
  if (type.value !== 'hold' || done.value || holding.value) return
  holding.value = true
  lastTime = performance.now()
  const tick = (now: number) => {
    if (!holding.value) return
    const dt = now - lastTime
    lastTime = now
    ratio.value = Math.min(1, ratio.value + dt / target.value)
    report()
    if (ratio.value >= 1) {
      holding.value = false
      settle()
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function stopHold() {
  if (!holding.value) return
  holding.value = false
  cancelAnimationFrame(raf)
}

function onPointerDown(event: PointerEvent) {
  if (type.value !== 'hold') return
  event.preventDefault()
  startHold()
}

function onPointerUp() {
  if (type.value === 'hold') stopHold()
}

function onKeydown(event: KeyboardEvent) {
  if (type.value === 'tap') return
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  startHold()
}

function onKeyup(event: KeyboardEvent) {
  if (type.value !== 'hold') return
  if (event.key !== ' ' && event.key !== 'Enter') return
  stopHold()
}

onMounted(() => window.addEventListener('pointerup', stopHold))
onBeforeUnmount(() => {
  window.removeEventListener('pointerup', stopHold)
  cancelAnimationFrame(raf)
})

// 让上方的图版也能直接操作：轻点等于一次点击，按住等于按住按钮
defineExpose({
  tap: onClick,
  holdStart: startHold,
  holdStop: stopHold,
})
</script>

<template>
  <div class="ctl">
    <button
      class="ctl__bar"
      :class="{ 'is-holding': holding, 'is-done': done }"
      :aria-label="`${action.verb}，${hint}`"
      @click="onClick"
      @contextmenu.prevent
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
      @keyup="onKeyup"
    >
      <span class="ctl__label">{{ action.verb }}</span>
      <span class="ctl__value">{{ valueText }}</span>
      <span class="ctl__track" aria-hidden="true">
        <i :style="{ transform: `scaleX(${ratio})` }" />
      </span>
    </button>

    <p class="ctl__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.ctl {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

// —— 控制条：所有工序同宽同高，不再为上下拖动单独加高 ——
.ctl__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  height: 3.25rem;
  padding: 0 1rem;
  border-radius: var(--o-radius-btn);
  background: var(--o-primary);
  color: #fdfbf6;
  overflow: hidden;
  // 连续轻点时不带出选中与系统菜单
  touch-action: none;
  user-select: none;
  -webkit-touch-callout: none;
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    background-color var(--o-dur-state) linear;

  &:active {
    transform: scale(0.985);
  }

  &.is-holding {
    background: var(--o-primary-deep);
  }

  &.is-done {
    background: var(--o-ink);
  }
}

.ctl__label {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.ctl__value {
  font-family: var(--o-font-serif);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  opacity: 0.82;
}

.ctl__track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0.125rem;
  background: rgba(253, 251, 246, 0.22);
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    background: #f3eee3;
    transform-origin: left center;
    transition: transform 120ms linear;
  }
}

.ctl__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--o-muted);
  text-align: center;
}
</style>
