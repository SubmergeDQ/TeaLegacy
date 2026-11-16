<script setup lang="ts">
// 状态分段筛选：可横滑，选中项是墨绿色实心块。
// 用 role="tablist" 表达"这几个是同一组视图开关"。
export interface SegmentedOption {
  value: string
  label: string
  count?: number
}

defineProps<{
  modelValue: string
  options: SegmentedOption[]
  /** 项多时按列数均分成多行，避免最后一项被切掉、也避免残行 */
  columns?: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div
    class="o-seg"
    :class="{ 'is-grid': columns }"
    :style="columns ? { '--o-seg-cols': String(columns) } : undefined"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="o-seg__item"
      :class="{ 'is-active': option.value === modelValue }"
      role="tab"
      :aria-selected="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      <span class="o-seg__label">{{ option.label }}</span>
      <span v-if="option.count !== undefined" class="o-seg__count">{{ option.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.o-seg {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-grid {
    display: grid;
    grid-template-columns: repeat(var(--o-seg-cols, 3), 1fr);
    overflow-x: visible;
  }

  &.is-grid .o-seg__item {
    justify-content: center;
  }
}

.o-seg__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  height: 1.875rem;
  padding: 0 0.6875rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  background: transparent;
  font-size: 0.75rem;
  color: var(--o-muted);
  white-space: nowrap;
  transition:
    background-color var(--o-dur-press) linear,
    border-color var(--o-dur-press) linear,
    color var(--o-dur-press) linear;

  // 可见 30px，触屏点击区沿纵向扩到 44px
  &::before {
    content: '';
    position: absolute;
    inset: -0.4375rem 0;
  }

  &:active {
    background: rgba(47, 79, 79, 0.05);
  }

  &.is-active {
    background: var(--o-ink);
    border-color: var(--o-ink);
    color: var(--o-on-ink);
  }
}

.o-seg__count {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}
</style>
