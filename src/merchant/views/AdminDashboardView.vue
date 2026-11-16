<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="概览"
    desc="今日经营数据与待办事项"
    :items="[
      '今日销售额/订单数/客单价/待发货四宫格',
      '近 7 日成交趋势（自绘 SVG 折线）',
      '待办提醒与热销 Top5',
    ]"
  />
</template>
