<script setup lang="ts">
import OButton from './OButton.vue'
import OIcon from './OIcon.vue'

// 空态：线稿图标 + 一句说明 + 一个能立刻开始的行动。
withDefaults(
  defineProps<{
    icon?: string
    text: string
    sub?: string
    action?: string
  }>(),
  { icon: 'box', sub: '', action: '' },
)

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="o-empty">
    <OIcon :name="icon" :size="36" class="o-empty__icon" />
    <p class="o-empty__text">{{ text }}</p>
    <p v-if="sub" class="o-empty__sub">{{ sub }}</p>
    <OButton v-if="action" type="outline" class="o-empty__action" @click="emit('action')">
      {{ action }}
    </OButton>
  </div>
</template>

<style scoped lang="scss">
.o-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.o-empty__icon {
  color: var(--o-disabled);
  margin-bottom: 0.5rem;
}

.o-empty__text {
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--o-title);
}

.o-empty__sub {
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--o-muted);
}

.o-empty__action {
  margin-top: 0.875rem;
}
</style>
