<script setup lang="ts">
// 状态标签：在售 / 下架 / 待发货 / 缺货……
// 语义色只表达状态，不承担装饰；字号固定 11px 起，避免小屏读不清。
withDefaults(
  defineProps<{
    tone?: 'success' | 'warn' | 'danger' | 'neutral' | 'info'
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span class="o-tag" :class="`o-tag--${tone}`"><slot /></span>
</template>

<style scoped lang="scss">
.o-tag {
  display: inline-flex;
  align-items: center;
  height: 1.25rem;
  padding: 0 0.375rem;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1;
  letter-spacing: 0.02em;
  white-space: nowrap;

  &--neutral {
    color: var(--o-muted);
    border-color: var(--o-line);
  }

  &--success {
    color: var(--o-success);
    border-color: rgba(63, 107, 74, 0.32);
    background: rgba(63, 107, 74, 0.07);
  }

  &--warn {
    color: var(--o-warn);
    border-color: rgba(168, 119, 40, 0.34);
    background: rgba(168, 119, 40, 0.09);
  }

  &--danger {
    color: var(--o-danger);
    border-color: rgba(165, 70, 58, 0.32);
    background: rgba(165, 70, 58, 0.07);
  }

  &--info {
    color: var(--o-info);
    border-color: rgba(74, 107, 115, 0.3);
    background: rgba(74, 107, 115, 0.07);
  }
}
</style>
