<script setup lang="ts">
import OIcon from './OIcon.vue'

withDefaults(defineProps<{ title?: string; back?: boolean }>(), {
  title: '',
  back: false,
})

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header class="o-navbar">
    <button v-if="back" class="o-navbar__back" aria-label="返回" @click="emit('back')">
      <OIcon name="back" :size="22" />
    </button>
    <h1 v-if="title" class="o-navbar__title">{{ title }}</h1>
    <div class="o-navbar__right"><slot name="right" /></div>
  </header>
</template>

<style scoped lang="scss">
.o-navbar {
  position: relative;
  display: flex;
  align-items: center;
  height: 3rem;
  padding: 0 0.5rem;
  padding-top: env(safe-area-inset-top);
  background: var(--o-paper);
  border-bottom: 1px solid var(--o-line);
  z-index: 20;
}

.o-navbar__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--o-title);
  transition: transform var(--o-dur-press) var(--o-ease-flow);

  &:active {
    transform: scale(0.9);
  }
}

.o-navbar__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--o-font-serif);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--o-title);
}

.o-navbar__right {
  margin-left: auto;
  min-width: 2.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
