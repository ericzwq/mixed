<template>
  <div></div>
</template>

<script>
import { AUTHORIZATION_URL } from '@/http/urls';

export default {
  name: 'index',
  created() { // code=c51afefd4e4ce89d065c9e132092bf60&shop_id=118976595
    let { query } = this.$route;
    this.$http.post(AUTHORIZATION_URL, {
      code: query.code,
      shopId: query.shop_id
    })
      .then(r => {
        if (r.data.code !== 1) {
          this.message.error('保存异常，请重试');
          setTimeout(() => window.close(), 5000);
        } else {
          window.close();
        }
      }, () => {
        this.$message.error('信息保存异常，请重试');
        setTimeout(() => window.close(), 5000);
      });
  }
};
</script>
