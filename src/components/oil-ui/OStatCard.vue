<script setup lang="ts">
import { computed } from 'vue'

// KPI 卡：标签、数值、环比、说明。
// 数值走 sans + tabular-nums，只有标题才用衬线（后台要效率，不要叙事）。
const props = withDefaults(
  defineProps<{
    label: string
    value: string
    delta?: number
    hint?: string
    tone?: 'plain' | 'primary' | 'ink'
  }>(),
  { delta: undefined, hint: '', tone: 'plain' },
)

const deltaText = computed(() =>
  props.delta === undefined ? '' : `${props.delta > 0 ? '+' : ''}${props.delta}%`,
)
const deltaTone = computed(() => {
  if (props.delta === undefined || props.delta === 0) return 'flat'
  return props.delta > 0 ? 'up' : 'down'
})
</script>

<template>
  <div class="o-stat" :class="`o-stat--${tone}`">
    <p class="o-stat__label">{{ label }}</p>
    <p class="o-stat__value">{{ value }}</p>
    <p class="o-stat__meta">
      <span v-if="delta !== undefined" class="o-stat__delta" :class="`is-${deltaTone}`">
        {{ deltaText }}
      </span>
      <span v-if="hint" class="o-stat__hint">{{ hint }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.o-stat {
  padding: 0.75rem 0.875rem 0.6875rem;
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
  background: var(--o-card);
}

.o-stat__label {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--o-muted);
}

.o-stat__value {
  margin-top: 0.25rem;
  font-family: var(--o-font-sans);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  color: var(--o-title);
}

.o-stat__meta {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin-top: 0.25rem;
  min-height: 1.0625rem;
  font-size: 0.6875rem;
  color: var(--o-muted);
}

.o-stat__delta {
  font-variant-numeric: tabular-nums;

  &.is-up {
    color: var(--o-success);
  }

  &.is-down {
    color: var(--o-danger);
  }

  &.is-flat {
    color: var(--o-muted);
  }
}

.o-stat__hint {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.o-stat--primary .o-stat__value {
  color: var(--o-primary);
}

.o-stat--ink {
  background: var(--o-ink);
  border-color: var(--o-ink);

  .o-stat__label {
    color: rgba(243, 238, 227, 0.72);
  }

  .o-stat__value {
    color: var(--o-on-ink);
  }

  .o-stat__meta,
  .o-stat__hint {
    color: rgba(243, 238, 227, 0.82);
  }

  .o-stat__delta.is-up {
    color: #a8c8ae;
  }

  .o-stat__delta.is-down {
    color: #e3aaa0;
  }
}
</style>
