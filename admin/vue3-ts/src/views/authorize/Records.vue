<template>
  <div/>
</template>

<script>
import {GET_ORDER_LIST_URL} from '@/http/urls';

export default {
  name: 'Records',
  props: ['item', 'row', 'skuIndex', 'setOrderList'],
  created() {
    if (this.item.pricingType === 0) return;
    this.$http.post(GET_ORDER_LIST_URL, {
      modelId: this.item.modelId,
      price: this.row.promotionPrice,
      startTime: this.item.startTime
    }, {noLoading: true}).then(r => {
      if (r.code === 1) this.setOrderList(r.data, this.row, this.item, this.skuIndex);
    });
  }
};
</script>
