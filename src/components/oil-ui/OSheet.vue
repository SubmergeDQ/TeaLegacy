<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import OIcon from './OIcon.vue'

// 底部弹层：筛选、发货、出入库这类单手操作的表单。
// Esc 关闭、焦点移入归还；Teleport 到 #app，避免随页面滚动跑位。
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    closeOnMask?: boolean
  }>(),
  { title: '', closeOnMask: true },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const panel = ref<HTMLElement>()
let lastFocused: Element | null = null

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  async (show) => {
    if (show) {
      lastFocused = document.activeElement
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      panel.value?.focus()
    } else {
      window.removeEventListener('keydown', onKeydown)
      if (lastFocused instanceof HTMLElement) lastFocused.focus()
      lastFocused = null
    }
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="#app">
    <Transition name="o-sheet">
      <div v-if="modelValue" class="o-sheet">
        <div class="o-sheet__mask" @click="closeOnMask && close()" />
        <div
          ref="panel"
          class="o-sheet__panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <header class="o-sheet__head">
            <h2 class="o-sheet__title">{{ title }}</h2>
            <button type="button" class="o-sheet__close" aria-label="关闭" @click="close">
              <OIcon name="close" :size="18" />
            </button>
          </header>

          <div class="o-sheet__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="o-sheet__foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.o-sheet {
  position: absolute;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.o-sheet__mask {
  position: absolute;
  inset: 0;
  background: var(--o-mask);
}

.o-sheet__panel {
  position: relative;
  width: 100%;
  max-height: 84%;
  overflow-y: auto;
  padding: 0 1rem calc(1rem + var(--o-safe-bottom));
  border-radius: 1.25rem 1.25rem 0 0;
  background: var(--o-card);
  box-shadow: var(--o-shadow-float);
  outline: none;
}

.o-sheet__head {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  height: 3.25rem;
  background: var(--o-card);
  border-bottom: 1px solid var(--o-line);
}

.o-sheet__title {
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.o-sheet__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-right: -0.5rem;
  color: var(--o-muted);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.9);
  }
}

.o-sheet__body {
  padding: 1rem 0 0.25rem;
}

.o-sheet__foot {
  padding-top: 0.75rem;
}

// 用 keyframes 而不是 enter-from：动画首帧就锁定在屏幕下方，
// 避免插入瞬间先按最终位置绘制、再回落的"从上往下闪一下"。
.o-sheet-enter-active {
  animation: o-sheet-mask-in var(--o-dur-state) linear both;
}

.o-sheet-enter-active .o-sheet__panel {
  animation: o-sheet-panel-in var(--o-dur-state) var(--o-ease-flow) both;
  will-change: transform;
}

.o-sheet-leave-active {
  animation: o-sheet-mask-out 180ms linear both;
}

.o-sheet-leave-active .o-sheet__panel {
  animation: o-sheet-panel-out 200ms var(--o-ease-flow) both;
}

@keyframes o-sheet-mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes o-sheet-panel-in {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes o-sheet-mask-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes o-sheet-panel-out {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
</style>
