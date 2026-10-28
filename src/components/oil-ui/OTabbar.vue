<script setup lang="ts">
import { computed } from 'vue'

import OIcon from './OIcon.vue'

export interface TabItem {
  key: string
  icon: string
  label: string
}

const props = defineProps<{
  modelValue: string
  items: TabItem[]
}>()

const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

// 选中指示：一块会移动的墨绿滑块，而非旧的熄灭、新的点亮
const activeIndex = computed(() =>
  Math.max(0, props.items.findIndex((it) => it.key === props.modelValue)),
)
const indicatorLeft = computed(
  () => `${((activeIndex.value + 0.5) / props.items.length) * 100}%`,
)
</script>

<template>
  <nav class="o-tabbar" aria-label="主导航">
    <span class="o-tabbar__indicator" :style="{ left: indicatorLeft }" />
    <button
      v-for="it in items"
      :key="it.key"
      class="o-tabbar__item"
      :class="{ 'is-active': it.key === modelValue }"
      :aria-current="it.key === modelValue ? 'page' : undefined"
      @click="emit('update:modelValue', it.key)"
    >
      <OIcon :name="it.icon" :size="22" />
      <span class="o-tabbar__label">{{ it.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.o-tabbar {
  position: relative;
  display: flex;
  background: var(--o-card);
  border-top: 1px solid var(--o-line);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 20;
}

.o-tabbar__indicator {
  position: absolute;
  // 挂在选中项文字下方，归属明确；跨项移动时仍是同一块
  bottom: calc(0.4375rem + env(safe-area-inset-bottom));
  width: 1rem;
  height: 0.125rem;
  border-radius: 999px;
  background: var(--o-ink);
  transform: translateX(-50%);
  transition: left var(--o-dur-state) var(--o-ease-flow);
}

.o-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  height: 3.25rem;
  color: var(--o-muted);
  transition: color var(--o-dur-state) var(--o-ease-flow);

  &.is-active {
    color: var(--o-ink);
  }

  .o-tabbar__label {
    font-size: 0.6875rem;
    letter-spacing: 0.05em;
    transition: font-weight var(--o-dur-state) linear;
  }

  &.is-active .o-tabbar__label {
    font-weight: 600;
  }
}
</style>
