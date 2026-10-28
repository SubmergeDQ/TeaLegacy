<script setup lang="ts">
import OButton from '@/components/oil-ui/OButton.vue'
import { formatPrice } from '@/utils/format'

defineProps<{ count: number; total: number; loading?: boolean }>()

const emit = defineEmits<{ settle: [] }>()
</script>

<template>
  <footer class="settle">
    <div class="settle__sum">
      <span class="settle__label">合计</span>
      <span class="settle__total">
        <i>¥</i><b>{{ formatPrice(total) }}</b>
      </span>
    </div>
    <OButton size="lg" :loading="loading" class="settle__btn" @click="emit('settle')">
      {{ loading ? '处理中' : `去结算（${count}）` }}
    </OButton>
  </footer>
</template>

<style scoped lang="scss">
.settle {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.625rem 1rem;
  padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
  background: var(--o-card);
  border-top: 1px solid var(--o-line);
  z-index: 20;
}

.settle__sum {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  flex: 1;
}

.settle__label {
  font-size: 0.8125rem;
  color: var(--o-muted);
}

.settle__total {
  font-family: var(--o-font-serif);
  color: var(--o-primary);

  i {
    font-style: normal;
    font-size: 0.8125rem;
    margin-right: 0.0625rem;
  }

  b {
    font-size: 1.375rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
  }
}

.settle__btn {
  flex-shrink: 0;
  min-width: 8.75rem;
}
</style>
