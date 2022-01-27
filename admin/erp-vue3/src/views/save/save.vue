<template>
  <div></div>
</template>

<script lang="ts" setup>
import {AUTHORIZATION_URL} from '@/http/urls';
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import http from "@/http/http";
import {ElMessage} from "element-plus";
import {SuccessResponse} from "@/types/types";

const route = useRoute()
onMounted(() => { // code=c51afefd4e4ce89d065c9e132092bf60&shop_id=118976595
  let {query} = route;
  http.post<never, SuccessResponse>(AUTHORIZATION_URL, {
    code: query.code,
    shopId: query.shop_id
  }).then(r => {
    if (r.code !== 1) {
      ElMessage.error('保存异常，请重试');
      setTimeout(() => window.close(), 5000);
    } else {
      window.close();
    }
  }, () => {
    // ElMessage.error('信息保存异常，请重试');
    setTimeout(() => window.close(), 5000);
  })
})
</script>
