<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="订单详情"
    desc="查看明细并发货"
    back
    :items="[
      '商品行与金额明细',
      '收货信息与备注',
      '物流时间轴',
      '发货 / 取消操作',
    ]"
  />
</template>
