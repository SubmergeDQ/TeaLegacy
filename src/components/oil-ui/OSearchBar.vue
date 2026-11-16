<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import OIcon from './OIcon.vue'

// 搜索框：输入即时回显，对外 300ms 防抖，避免每敲一个字都过滤整张列表。
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    debounce?: number
  }>(),
  { placeholder: '搜索', debounce: 300 },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const text = ref(props.modelValue)
let timer: number | undefined

watch(
  () => props.modelValue,
  (value) => {
    if (value !== text.value) text.value = value
  },
)

watch(text, (value) => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => emit('update:modelValue', value.trim()), props.debounce)
})

function clear() {
  window.clearTimeout(timer)
  text.value = ''
  emit('update:modelValue', '')
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <label class="o-search">
    <OIcon name="search" :size="17" class="o-search__icon" />
    <input
      v-model="text"
      class="o-search__input"
      type="search"
      enterkeyhint="search"
      :placeholder="placeholder"
      aria-label="搜索"
    />
    <button
      v-if="text"
      type="button"
      class="o-search__clear"
      aria-label="清空搜索"
      @click="clear"
    >
      <OIcon name="close" :size="15" />
    </button>
  </label>
</template>

<style scoped lang="scss">
.o-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-btn);
  background: var(--o-card);
}

.o-search__icon {
  color: var(--o-muted);
}

.o-search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  color: var(--o-title);
  appearance: none;

  &::placeholder {
    color: var(--o-muted);
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
}

.o-search__clear {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--o-line);
  color: var(--o-paper);

  // 触屏点击区扩到 44px
  &::before {
    content: '';
    position: absolute;
    inset: -0.75rem;
  }
}
</style>
