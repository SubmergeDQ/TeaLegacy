<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import OIcon from '@/components/oil-ui/OIcon.vue'
import { craftTeas } from '@/catalog/craft'
import { useCraftStore } from '@/stores/craft'

// 制茶入口：先选一款茶，再进互动工序。
// 这里不做商品陈列，只交代"要做什么、几步、多久"。

const router = useRouter()
const craft = useCraftStore()

const doneCount = computed(() => craftTeas.filter((t) => craft.done(t.id)).length)
</script>

<template>
  <div class="craft">
    <header class="craft__head">
      <div class="craft__eyebrow">
        <span>制茶</span>
        <span class="craft__count">已制成 {{ doneCount }} / {{ craftTeas.length }}</span>
      </div>
      <h1 class="craft__title">选一款茶，亲手做一遍</h1>
      <p class="craft__sub">采、炒、揉、压，五步成一饼。做完就能把它带走。</p>
    </header>

    <ul class="craft__list">
      <li v-for="tea in craftTeas" :key="tea.id">
        <button class="craft__card" @click="router.push(`/craft/${tea.id}`)">
          <span class="craft__art">
            <img :src="tea.art" :alt="tea.name" />
          </span>

          <span class="craft__info">
            <span class="craft__name-row">
              <span class="craft__name">{{ tea.name }}</span>
              <span v-if="craft.done(tea.id)" class="craft__done">已制成</span>
            </span>
            <span class="craft__meta">
              {{ tea.sub }} · {{ tea.steps.length }} 步 · {{ tea.duration }}
            </span>
            <span class="craft__intro">{{ tea.intro }}</span>
          </span>

          <OIcon name="arrow" :size="18" class="craft__arrow" />
        </button>
      </li>
    </ul>

    <blockquote class="craft__quote">看一遍不如做一遍——手上过一遍，才知一饼茶的分量。</blockquote>

    <p class="craft__foot">每款茶五步，约半分钟。做完可当场购买同款。</p>
  </div>
</template>

<style scoped lang="scss">
.craft {
  padding: 0 1rem 1.5rem;
}

.craft__head {
  padding: 0.75rem 0 1rem;
}

.craft__eyebrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.6875rem;
  letter-spacing: 0.28em;
  color: var(--o-primary);
}

.craft__count {
  font-family: var(--o-font-serif);
  letter-spacing: 0.08em;
  color: var(--o-muted);
}

.craft__title {
  margin-top: 0.375rem;
  font-family: var(--o-font-serif);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.35;
  color: var(--o-title);
}

.craft__sub {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--o-muted);
}

.craft__list {
  border-top: 1px solid var(--o-line);
}

.craft__card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 0;
  text-align: left;
  border-bottom: 1px solid var(--o-line);
  transition:
    transform var(--o-dur-press) var(--o-ease-flow),
    opacity var(--o-dur-press) linear;

  &:active {
    transform: scale(0.99);
    opacity: 0.86;
  }
}

// 茶样：线稿落在浅茶底上，像一枚贴进册页的样张
.craft__art {
  flex-shrink: 0;
  width: 5rem;
  height: 5rem;
  border-radius: var(--o-radius-img);
  background: #efeade;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.craft__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.craft__name-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.craft__name {
  font-family: var(--o-font-serif);
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--o-title);
}

// 已制成：一枚小小的落款，不做成彩色角标
.craft__done {
  flex-shrink: 0;
  padding: 0 0.25rem;
  border: 1px solid var(--o-primary);
  border-radius: 0.125rem;
  font-family: var(--o-font-serif);
  font-size: 0.5625rem;
  line-height: 1.35;
  letter-spacing: 0.1em;
  color: var(--o-primary);
}

.craft__meta {
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  color: var(--o-muted);
}

.craft__intro {
  margin-top: 0.1875rem;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--o-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.craft__arrow {
  flex-shrink: 0;
  color: var(--o-disabled);
}

.craft__quote {
  margin: 1.5rem 0 0;
  padding-left: 0.75rem;
  border-left: 1px solid var(--o-primary);
  font-family: var(--o-font-serif);
  font-size: 0.8125rem;
  line-height: 1.9;
  letter-spacing: 0.02em;
  color: var(--o-text);
  text-align: left;
}

.craft__foot {
  margin-top: 0.875rem;
  font-size: 0.6875rem;
  line-height: 1.6;
  letter-spacing: 0.04em;
  color: var(--o-muted);
  text-align: center;
}
</style>
