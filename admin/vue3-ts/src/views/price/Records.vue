<template>
  <div/>
</template>

<script setup lang="ts">
import {GET_ORDER_LIST_URL} from '@/http/urls';
import {onMounted, toRefs, defineProps} from "vue";
import http from "@/http/http";
import {ExtAxiosRequestConfig} from "@/types/ext-types";
import {ItemRow, SkuRow} from "@/views/price/price-types";

const props = defineProps<{
  item: SkuRow
  row: ItemRow
  skuIndex: number
  setOrderList: () => void
}>()

//   name: 'Records',
//   props: ['item', 'row', 'skuIndex', 'setOrderList'],
const {item, row} = toRefs(props)
console.log(item, row)

onMounted(() => {
  if (item.pricingType === 0) return;
  http.post(GET_ORDER_LIST_URL, {
    modelId: item.modelId,
    lowestPrice: item.promotionPrice,
    startTime: item.startTime
  }, {noLoading: true} as ExtAxiosRequestConfig).then(r => {
    // if (r.code === 1) this.setOrderList(r.data, this.row, this.item, this.skuIndex);
  });
})
</script>
