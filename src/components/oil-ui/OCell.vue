<script setup lang="ts">
import OIcon from './OIcon.vue'

// 信息行 / 设置项：左侧标签，右侧值或自定义内容，可点则带箭头。
withDefaults(
  defineProps<{
    label: string
    value?: string
    arrow?: boolean
    clickable?: boolean
    hint?: string
    /** 危险动作（重置、删除）用朱砂色标签 */
    tone?: 'default' | 'danger'
  }>(),
  { value: '', arrow: false, clickable: false, hint: '', tone: 'default' },
)

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    class="o-cell"
    :class="{ 'is-clickable': clickable }"
    @click="clickable && emit('click')"
  >
    <div class="o-cell__main">
      <span class="o-cell__label" :class="`is-${tone}`">{{ label }}</span>
      <span v-if="hint" class="o-cell__hint">{{ hint }}</span>
    </div>
    <div class="o-cell__right">
      <slot name="value">
        <span v-if="value" class="o-cell__value">{{ value }}</span>
      </slot>
      <slot />
      <OIcon v-if="arrow" name="back" :size="16" class="o-cell__arrow" />
    </div>
  </component>
</template>

<style scoped lang="scss">
.o-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0.5rem 0;
  text-align: left;
  color: var(--o-title);

  & + & {
    border-top: 1px solid var(--o-line);
  }

  &.is-clickable {
    cursor: pointer;
    transition: background-color var(--o-dur-press) linear;

    &:active {
      background: rgba(47, 79, 79, 0.04);
    }
  }
}

.o-cell__main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
}

.o-cell__label {
  font-size: 0.875rem;
  color: var(--o-title);

  &.is-danger {
    color: var(--o-danger);
  }
}

.o-cell__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--o-muted);
}

.o-cell__right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.o-cell__value {
  font-size: 0.8125rem;
  color: var(--o-muted);
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 右箭头复用 back 图标（同一笔法），旋转 180°
.o-cell__arrow {
  color: var(--o-disabled);
  transform: rotate(180deg);
}
</style>
