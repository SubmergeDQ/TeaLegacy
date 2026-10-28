<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ value: number; max?: number }>(), {
  max: 99,
})

const text = computed(() => {
  if (props.value <= 0) return ''
  return props.value > props.max ? `${props.max}+` : String(props.value)
})
</script>

<template>
  <span v-if="text" class="o-badge">{{ text }}</span>
</template>

<style scoped lang="scss">
.o-badge {
  display: inline-block;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: var(--o-primary);
  color: #fdfbf6;
  font-size: 0.625rem;
  line-height: 1rem;
  text-align: center;
  font-weight: 600;
}
</style>
