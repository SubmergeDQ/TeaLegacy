<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="商品管理"
    desc="七款普洱的价格、库存与上下架"
    :items="[
      '搜索与分类筛选',
      '商品卡（价格/库存/上下架开关）',
      '低库存预警',
      '上拉加载',
    ]"
  />
</template>
