<script setup lang="ts">
import { hideToast, toastState } from './toast'

// 距顶偏移由页面决定：出现时在页头下方，避开商品价格与底部按钮
withDefaults(defineProps<{ topOffset?: string }>(), { topOffset: '4rem' })

function onAction() {
  toastState.action?.handler()
  hideToast()
}
</script>

<template>
  <Transition name="o-toast">
    <div
      v-if="toastState.visible"
      class="o-toast"
      role="status"
      :style="{ top: `calc(${topOffset} + env(safe-area-inset-top))` }"
    >
      <span class="o-toast__text">{{ toastState.text }}</span>
      <button v-if="toastState.action" class="o-toast__action" @click="onAction">
        {{ toastState.action.text }}
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.o-toast {
  position: absolute;
  left: 50%;
  // top 由页面通过 topOffset 传入（内联覆盖）
  top: 4rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  // 绝对定位 + left:50% 会让宽度被限制在半个容器内，这里按内容宽度撑开
  width: max-content;
  max-width: calc(100% - 2rem);
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  background: rgba(42, 38, 31, 0.95);
  color: #f3eee3;
  font-size: 0.8125rem;
  box-shadow: var(--o-shadow-float);
  z-index: 60;
  // 提示浮在内容上，但不能拦住下面的点击（连续加购时最容易撞上）
  pointer-events: none;
}

.o-toast__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.o-toast__action {
  flex-shrink: 0;
  color: #d9a26b;
  font-weight: 600;
  letter-spacing: 0.04em;
  pointer-events: auto;
}

.o-toast-enter-active,
.o-toast-leave-active {
  transition:
    opacity var(--o-dur-state) var(--o-ease-flow),
    transform var(--o-dur-state) var(--o-ease-flow);
}

.o-toast-enter-from,
.o-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-0.5rem);
}
</style>
