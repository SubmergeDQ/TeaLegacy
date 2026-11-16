<script setup lang="ts">
// 订单时间轴：已完成的一步是实心墨点 + 时间，未完成是空心点 + "待处理"。
// 只认结构，不依赖具体业务类型，别的流程也能复用。
defineProps<{
  items: { label: string; at: number; done: boolean }[]
}>()

const pad = (n: number) => String(n).padStart(2, '0')

function timeLabel(at: number): string {
  if (at <= 0) return '待处理'
  const d = new Date(at)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <ol class="o-timeline">
    <li
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      class="o-timeline__item"
      :class="{ 'is-done': item.done, 'is-last': index === items.length - 1 }"
    >
      <span class="o-timeline__rail" aria-hidden="true" />
      <span class="o-timeline__dot" aria-hidden="true" />
      <div class="o-timeline__body">
        <p class="o-timeline__label">{{ item.label }}</p>
        <p class="o-timeline__time">{{ timeLabel(item.at) }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.o-timeline {
  display: grid;
}

.o-timeline__item {
  position: relative;
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;

  &.is-last {
    padding-bottom: 0;
  }
}

.o-timeline__rail {
  position: absolute;
  left: 0.3125rem;
  top: 0.75rem;
  bottom: -0.25rem;
  width: 1px;
  background: var(--o-line);
}

.is-last .o-timeline__rail {
  display: none;
}

.o-timeline__dot {
  position: relative;
  z-index: 1;
  width: 0.6875rem;
  height: 0.6875rem;
  flex-shrink: 0;
  margin-top: 0.1875rem;
  border: 1px solid var(--o-disabled);
  border-radius: 50%;
  background: var(--o-card);
}

.is-done .o-timeline__dot {
  border-color: var(--o-ink);
  background: var(--o-ink);
}

.o-timeline__body {
  display: grid;
  gap: 0.0625rem;
}

.o-timeline__label {
  font-size: 0.8125rem;
  color: var(--o-muted);
}

.is-done .o-timeline__label {
  color: var(--o-title);
}

.o-timeline__time {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--o-muted);
}
</style>
