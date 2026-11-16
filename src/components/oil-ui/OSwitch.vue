<script setup lang="ts">
// 开关：上下架、营业状态、通知开关。
// 可见轨道按 375 稿比例画，点击区扩到 44×44；带 role="switch"。
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
    /** 无可见文字时给读屏用 */
    label?: string
  }>(),
  { disabled: false, label: '' },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="o-switch"
    :class="{ 'is-on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="o-switch__track" aria-hidden="true">
      <span class="o-switch__knob" />
    </span>
  </button>
</template>

<style scoped lang="scss">
.o-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-right: -0.5rem;
  flex-shrink: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.o-switch__track {
  position: relative;
  display: block;
  width: 2.5rem;
  height: 1.4375rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  background: var(--o-paper);
  transition:
    background-color var(--o-dur-state) linear,
    border-color var(--o-dur-state) linear;
}

.o-switch__knob {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: var(--o-card);
  box-shadow: 0 1px 2px rgba(28, 25, 18, 0.18);
  transition: transform var(--o-dur-state) var(--o-ease-flow);
}

.o-switch.is-on .o-switch__track {
  background: var(--o-ink);
  border-color: var(--o-ink);
}

.o-switch.is-on .o-switch__knob {
  transform: translateX(1.0625rem);
  background: var(--o-on-ink);
}

.o-switch:active:not(:disabled) .o-switch__knob {
  transform: scale(0.94);
}

.o-switch.is-on:active:not(:disabled) .o-switch__knob {
  transform: translateX(1.0625rem) scale(0.94);
}
</style>
