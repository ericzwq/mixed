<template>
  <div/>
</template>

<script setup lang="ts">
import {GET_AUTO_PRICE_DETAIL_URL, GET_ORDER_LIST_URL} from '@/http/urls';
import {defineProps, toRefs, unref} from "vue";
import http from "@/http/http";
import {ExtAxiosRequestConfig} from "@/types/ext-types";
import {PricingType, SkuRow} from "@/views/price/price-types";
import {SuccessResponse} from "@/types/types";

const props = defineProps<{
  skuRow: SkuRow
  itemIndex: number
  skuIndex: number
  setOrderList: (...args: any[]) => void
}>()

const {skuRow, setOrderList, itemIndex, skuIndex} = toRefs(props)
if (!skuRow.value.getOrder && skuRow.value.pricingType !== PricingType.noPrice) {
  const urlMap: Record<number, string> = {
    [PricingType.autoPrice]: GET_AUTO_PRICE_DETAIL_URL,
    [PricingType.limitPrice]: GET_ORDER_LIST_URL
  }
  http.post<never, SuccessResponse>(urlMap[skuRow.value.pricingType] as string, {
    modelId: skuRow.value.modelId,
    lowestPrice: skuRow.value.promotionPrice,
    startTime: skuRow.value.startTime
  }, {noLoading: true} as ExtAxiosRequestConfig).then(r => {
    if (r.code === 1) setOrderList.value(r.data, unref(itemIndex), unref(skuIndex))
  })
}
</script>
