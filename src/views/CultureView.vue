<script setup lang="ts">
// 文化板块占位页：按需求仅居中一行字
</script>

<template>
  <div class="culture">
    <p class="culture__hint">文化介绍与制茶互动演示，敬请期待</p>
  </div>
</template>

<style scoped lang="scss">
.culture {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
}

.culture__hint {
  font-family: var(--o-font-serif);
  font-size: 0.9375rem;
  letter-spacing: 0.16em;
  line-height: 1.9;
  color: var(--o-muted);
  text-align: center;
}
</style>
