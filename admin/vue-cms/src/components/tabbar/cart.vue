<template>
  <div class="cms_cart">
    <p v-if="!data.length" style="text-align: center;margin-top: 200px">暂无数据!建议您去商城逛逛哦</p>
    <!--cart list-->
    <div class="cc_option" v-for="i in cartList" :key="i.id" v-if="data.length">
      <mt-switch class="cc_switch" v-model="i.selected" @change="updateState(i)"></mt-switch>
      <div class="cc_img"><img :src="i.thumb_path" alt="图片飞了~"></div>
      <div class="cc_info">
        <h4 class="cc_tit">{{ i.title }}</h4>
        <div class="cc_num">
          <span class="cc_price">&yen;{{ i.sell_price }}</span>
          <numbox :i="i"></numbox>
          <a class="cc_del" @click="delGoods(i)">删除</a>
        </div>
      </div>
    </div>
    <!--total money-->
    <div class="cc_check" v-if="data.length">
      <div class="cc_money">
        <p class="cc_text">总计（不含运费）</p>
        <p class="cc_total">已选商品<strong>{{ selCount }}</strong>件，总价：<strong>&yen;{{ totalMoney }}</strong></p>
      </div>
      <mt-button size="small" type="danger" class="cc_buy">去结算</mt-button>
    </div>
  </div>
</template>

<script>
  import goods_numbox from "../goods/goods_numbox.vue";
  import {mapState} from 'vuex';

  export default {
    name: 'cart',
    components: {numbox: goods_numbox},
    // computed: {
    //     test() {
    //     },
    //     ...mapState(['count', 'data', 'totalMoney'])
    // },
    computed: {
      test() {
      },
      ...mapState({count: s => s.count, data: s => s.data, totalMoney: s => s.totalMoney})
    },
    data() {
      return {
        stateData: this.$store.state.data,
        cartList: [],
        selCount: 0,
      }
    },
    methods: {
      getCartList() {
        if (!this.$store.state.data.length) return;
        let idStr = '';
        this.stateData.forEach(v => {
          idStr += v.id + ','
        })
        idStr = idStr.substring(0, idStr.length - 1);
        this.$http.get('api/goods/getshopcarlist/' + idStr).then(res => {
          if (res.body.status === 0) {
            res.body.message.forEach(v => {
              this.stateData.forEach(i => {
                if (v.id.toString() === i.id.toString()) {
                  v.cou = i.cou;
                  v.selected = i.selected;
                  if (i.selected) this.selCount++;
                }
              })
            });
            this.cartList = res.body.message;
          } else {
            console.log(res)
            this.$err();
          }
        }, err => {
          console.log(err)
          this.$err();
        });
      },
      updateState(i) {
        this.selCount = i.selected ? (this.selCount + 1) : (this.selCount - 1);
        this.$store.commit('updateState', {id: parseInt(i.id), selected: i.selected,});
      },
      delGoods(i) {
        this.$store.commit('deleteGoods', i.id);
        this.getCartList();
        if (i.selected) this.selCount--;
      }
    },
    created() {
      this.getCartList();
    }
  }
</script>

<style lang="less" scoped>
  .cms_cart {
    padding: 10px 5px 0;

    .cc_option {
      margin-top: 10px;
      display: flex;
      background: #fff;
      align-items: center;
      justify-content: space-around;

      .cc_switch {
        text-align: center;
        align-items: center;
        display: flex;
        flex: 1;
        padding: 0 10px;
      }

      .cc_img {
        flex: 2;

        img {
          width: 100%;
          display: block;
        }
      }

      .cc_info {
        flex: 6;
        padding: 10px;

        .cc_tit {
          font-size: 14px;
        }

        .cc_num {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          margin-top: 15px;

          .cc_price {
            color: red;
          }
        }
      }
    }

    .cc_check {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      margin-top: 10px;
      padding: 0 5px;

      .cc_money {
        padding: 10px 20px 0;

        .cc_text {
        }

        .cc_total {
          strong {
            color: red;
          }
        }
      }

      .cc_buy {
        margin-right: 20px;
      }
    }
  }
</style>