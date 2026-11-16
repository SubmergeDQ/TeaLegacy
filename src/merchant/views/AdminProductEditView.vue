<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="编辑商品"
    desc="修改价格、库存与上下架"
    back
    :items="[
      '价格与库存',
      '规格与简介',
      '上下架开关',
      '保存校验',
    ]"
  />
</template>
