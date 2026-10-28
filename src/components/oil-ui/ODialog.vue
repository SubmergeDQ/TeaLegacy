<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ modelValue: boolean; closeOnMask?: boolean }>(), {
  closeOnMask: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const card = ref<HTMLElement>()
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
      card.value?.focus()
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
  <Transition name="o-dialog">
    <div v-if="modelValue" class="o-dialog">
      <div class="o-dialog__mask" @click="closeOnMask && close()" />
      <div ref="card" class="o-dialog__card" role="dialog" aria-modal="true" tabindex="-1">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.o-dialog {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
}

.o-dialog__mask {
  position: absolute;
  inset: 0;
  background: var(--o-mask);
}

.o-dialog__card {
  position: relative;
  width: 18.75rem;
  max-width: 82%;
  padding: 1.75rem 1.25rem 1.25rem;
  border-radius: var(--o-radius-card);
  background: var(--o-card);
  box-shadow: var(--o-shadow-float);
  outline: none;
}

.o-dialog-enter-active {
  transition: opacity 200ms linear;
}

.o-dialog-leave-active {
  transition: opacity 180ms linear;
}

.o-dialog-enter-active .o-dialog__card {
  transition: transform 220ms var(--o-ease-flow);
}

.o-dialog-leave-active .o-dialog__card {
  transition: transform 180ms linear;
}

.o-dialog-enter-from,
.o-dialog-leave-to {
  opacity: 0;
}

.o-dialog-enter-from .o-dialog__card {
  transform: scale(0.96);
}

.o-dialog-leave-to .o-dialog__card {
  transform: scale(0.98);
}
</style>
