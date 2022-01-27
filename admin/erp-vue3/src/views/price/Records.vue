<template>
  <div/>
</template>

<script setup lang="ts">
import {GET_AUTO_PRICE_DETAIL_URL, GET_ORDER_LIST_URL} from '@/http/urls';
import {defineProps, onUpdated} from "vue";
import http from "@/http/http";
import {ExtAxiosRequestConfig} from "@/types/ext-types";
import {AutoPriceData, LimitPriceData, PricingType, SkuRow} from "@/views/price/price-types";
import {SuccessResponse} from "@/types/types";

const props = defineProps<{
  skuRow: SkuRow
  itemIndex: number
  skuIndex: number
  setOrderList: (data: AutoPriceData | LimitPriceData, itemIndex: number, skuIndex: number) => void
}>()

// eslint-disable-next-line vue/no-setup-props-destructure
const {skuRow, setOrderList, itemIndex, skuIndex} = props
onUpdated(() => console.log('record update'))
if (!skuRow.getOrder && skuRow.pricingType !== PricingType.noPrice) {
  const urlMap: Record<number, string> = {
    [PricingType.autoPrice]: GET_AUTO_PRICE_DETAIL_URL,
    [PricingType.limitPrice]: GET_ORDER_LIST_URL
  }
  http.post<never, SuccessResponse<AutoPriceData | LimitPriceData>>(urlMap[skuRow.pricingType] as string, {
    modelId: skuRow.modelId,
    lowestPrice: skuRow.promotionPrice,
    startTime: skuRow.startTime
  }, {noLoading: true} as ExtAxiosRequestConfig).then(r => {
    if (r.code === 1) setOrderList(r.data, itemIndex, skuIndex)
  })
}
</script>
