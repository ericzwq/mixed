<template>
  <div class="v_num">
    <span class="minus" @click="updateNum(i,$event)">-</span><span
      class="count" ref="count">{{ i.cou }}</span><span class="add"
                                                        @click="updateNum(i,$event)">+</span>
  </div>
</template>

<script>
  export default {
    name: "numbox",
    props: ['i'],
    methods: {
      updateNum(i, e) { //获取当前数量值
        let value = parseInt(this.$refs.count.innerText)
        if (e.target.className === 'add') {
          if (value === 10) {
            this.$toast('亲，一次不能超过这么多哦~')
          }
          value = value >= 10 ? 10 : value + 1;
        } else {
          if (value === 1) {
            this.$toast('亲，至少选一个哦~')
          }
          value = value <= 1 ? 1 : value - 1;
        }
        this.$refs.count.innerText = value;
        this.$store.commit('addGoods', {id: i.id, cou: value});
      },
    }
  }
</script>

<style lang="less" scoped>
  .v_num {
    span {
      display: inline-block;
      text-align: center;
      width: 30px;
      height: 30px;
      line-height: 28px;
      border: 1px #ccc solid;
      font-size: 15px;
      margin-left: -1px;
    }
  }
</style>