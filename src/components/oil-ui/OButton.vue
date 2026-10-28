<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'primary' | 'outline'
    size?: 'md' | 'lg'
    block?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  { type: 'primary', size: 'md', block: false, disabled: false, loading: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    class="o-btn"
    :class="[`o-btn--${type}`, `o-btn--${size}`, { 'o-btn--block': block }]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="o-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.o-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--o-radius-btn);
  font-weight: 500;
  letter-spacing: 0.02em;
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    background-color var(--o-dur-press) linear,
    opacity var(--o-dur-press) linear;

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &--md {
    height: 2.5rem;
    padding: 0 1.125rem;
    font-size: 0.875rem;
  }

  &--lg {
    height: 3rem;
    padding: 0 1.5rem;
    font-size: 0.9375rem;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &--primary {
    background: var(--o-primary);
    color: #fdfbf6;

    &:active:not(:disabled) {
      background: var(--o-primary-deep);
    }
  }

  &--outline {
    background: transparent;
    border: 1px solid var(--o-ink);
    color: var(--o-ink);

    &:active:not(:disabled) {
      background: rgba(47, 79, 79, 0.06);
    }
  }
}

.o-btn__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1.5px solid rgba(253, 251, 246, 0.35);
  border-top-color: #fdfbf6;
  animation: o-spin 700ms linear infinite;
}

@keyframes o-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
