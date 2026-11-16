<script setup lang="ts">
import { useRouter } from 'vue-router'

import ONavBar from '@/components/oil-ui/ONavBar.vue'

// M0 骨架占位卡：页面结构先立起来，内容按文档逐页替换。
const props = withDefaults(
  defineProps<{
    title: string
    desc: string
    items?: string[]
    /** 次级页显示返回栏 */
    back?: boolean
  }>(),
  { items: () => [], back: false },
)

const router = useRouter()

function onBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/admin/dashboard')
}

defineExpose({ props })
</script>

<template>
  <div class="soon">
    <ONavBar v-if="back" :title="title" back @back="onBack" />

    <div class="soon__body">
      <header v-if="!back" class="soon__head">
        <h1 class="soon__title">{{ title }}</h1>
        <span class="soon__badge">建设中</span>
      </header>

      <section class="soon__card">
        <p class="soon__desc">{{ desc }}</p>

        <ul v-if="items.length" class="soon__list">
          <li v-for="it in items" :key="it">
            <span class="soon__dot" aria-hidden="true" />
            {{ it }}
          </li>
        </ul>

        <p class="soon__foot">M0 骨架 · 内容按 docs/architecture/merchant-app.md 逐步实现</p>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.soon {
  min-height: 100%;
  padding-bottom: 1.5rem;
}

.soon__body {
  padding: 0.75rem 1rem 0;
}

.soon__head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.25rem 0 1rem;
}

.soon__title {
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--o-title);
}

.soon__badge {
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--o-line);
  border-radius: 999px;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.soon__card {
  padding: 1rem;
  background: var(--o-card);
  border: 1px solid var(--o-line);
  border-radius: var(--o-radius-card);
}

.soon__desc {
  font-size: 0.875rem;
  color: var(--o-text);
}

.soon__list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--o-line);
  font-size: 0.8125rem;
  color: var(--o-muted);
}

.soon__list li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.soon__dot {
  width: 0.25rem;
  height: 0.25rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--o-ink);
  transform: translateY(-0.15rem);
}

.soon__foot {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--o-line);
  font-size: 0.6875rem;
  color: var(--o-disabled);
}
</style>
