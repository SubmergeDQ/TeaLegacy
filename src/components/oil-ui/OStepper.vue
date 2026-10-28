<script setup lang="ts">
import { computed } from 'vue'

import OIcon from './OIcon.vue'

const props = withDefaults(
  defineProps<{ modelValue: number; min?: number; max?: number }>(),
  { min: 1, max: 99 },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const atMin = computed(() => props.modelValue <= props.min)
const atMax = computed(() => props.modelValue >= props.max)

function step(delta: number) {
  const next = props.modelValue + delta
  if (next < props.min || next > props.max) return
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="o-stepper" role="group" aria-label="数量调整">
    <button
      class="o-stepper__btn"
      :disabled="atMin"
      aria-label="减少数量"
      @click="step(-1)"
    >
      <OIcon name="minus" :size="14" />
    </button>
    <span class="o-stepper__num">{{ modelValue }}</span>
    <button
      class="o-stepper__btn"
      :disabled="atMax"
      aria-label="增加数量"
      @click="step(1)"
    >
      <OIcon name="plus" :size="14" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.o-stepper {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--o-line);
  border-radius: 0.5rem;
  background: var(--o-card);
}

.o-stepper__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--o-text);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  // 可见 28px，触屏点击区扩到 44px（相邻目标垂直方向扩展，不重叠）
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2.75rem;
    transform: translateY(-50%);
  }

  &:active:not(:disabled) {
    transform: scale(0.88);
  }

  &:disabled {
    color: var(--o-disabled);
    cursor: not-allowed;
  }
}

.o-stepper__num {
  min-width: 1.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
}
</style>
