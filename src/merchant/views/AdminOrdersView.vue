<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="订单管理"
    desc="按状态处理待发货与售后"
    :items="[
      '状态分段筛选（待付款/待发货/已发货/已完成/已取消）',
      '订单卡与主操作（发货/取消）',
      '发货弹层（物流公司 + 运单号）',
      '分页加载',
    ]"
  />
</template>
