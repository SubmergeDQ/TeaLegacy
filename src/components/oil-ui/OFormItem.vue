<script setup lang="ts">
// 表单行：标签 + 控件 + 错误/提示。
// 校验错误内联在控件下方，不弹窗打断填写。
withDefaults(
  defineProps<{
    label: string
    required?: boolean
    error?: string
    hint?: string
  }>(),
  { required: false, error: '', hint: '' },
)
</script>

<template>
  <div class="o-form-item" :class="{ 'has-error': !!error }">
    <p class="o-form-item__label">
      {{ label }}
      <span v-if="required" class="o-form-item__req" aria-hidden="true">必填</span>
    </p>
    <div class="o-form-item__control">
      <slot />
    </div>
    <p v-if="error" class="o-form-item__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="o-form-item__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.o-form-item {
  display: grid;
  gap: 0.375rem;
}

.o-form-item__label {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.o-form-item__req {
  font-size: 0.625rem;
  letter-spacing: 0;
  color: var(--o-danger);
}

.o-form-item__error {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-danger);
}

.o-form-item__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-muted);
}
</style>
