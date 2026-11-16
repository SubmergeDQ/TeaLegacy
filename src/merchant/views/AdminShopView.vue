<script setup lang="ts">

import ComingSoon from '@/merchant/components/ComingSoon.vue'
</script>

<template>
  <ComingSoon
    title="我的"
    desc="店铺设置与演示数据"
    :items="[
      '店铺信息与营业状态',
      '通知开关',
      '演示数据重置',
      '退出登录',
    ]"
  />
</template>
