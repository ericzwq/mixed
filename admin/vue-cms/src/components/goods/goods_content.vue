<template>
    <div class="gc">
        <transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter">
            <span class="ball" v-show="show"></span>
        </transition>
        <!--轮播图-->
        <slider :list="gImg" :is-full="false"></slider>
        <!--描述-->
        <div class="mui-card gc_desc">
            <div class="mui-card-header">{{ gContent.title }}</div>
            <div class="mui-card-content">
                <div class="mui-card-content-inner">
                    <p class="gc_price"><span>市场价：<del>&yen;{{ gContent.market_price }}</del></span> <span>销售价：<strong>&yen;{{ gContent.sell_price }}</strong></span>
                    </p>
                    <div class="gc_num">
                        <strong>购买数量：</strong><span class="minus" @click="cou > 1 ? cou-- : null">-</span><span
                            class="count" ref="count">{{ cou }}</span><span class="add"
                                                                            @click="cou < 10 ? cou++ : null">+</span>
                    </div>
                    <div class="gc_buy">
                        <mt-button type="primary" size="small">立即购买</mt-button>
                        <mt-button type="danger" size="small" @click="addCart">加入购物车</mt-button>
                    </div>
                </div>
            </div>
        </div>
        <!--参数-->
        <div class="mui-card">
            <div class="mui-card-header">商品参数</div>
            <div class="mui-card-content">
                <div class="mui-card-content-inner">
                    <p>商品货号：{{ gContent.goods_no}}</p>
                    <p>库存数量：{{ gContent.stock_quantity }}</p>
                    <p>上架时间：{{ gContent.add_time | dataFormat }}</p>
                </div>
            </div>
        </div>
        <mt-button type="primary" plain size="large" @click="toGoodsDesc(gContent.id)">图文介绍</mt-button>
        <comments :id="id"></comments>
    </div>
</template>

<script>
    import slider from "../common/slider.vue";
    import comments from "../common/comments.vue";

    export default {
        name: "goods_content",
        components: {
            slider,
            comments
        },
        data() {
            return {
                id: this.$route.params.id,
                gContent: {},
                gDesc: [],
                gImg: [],
                cou: 1,
                show: false
            }
        },
        methods: {
            getGoodsContent() {
                this.$http.get('api/goods/getinfo/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        this.gContent = res.body.message[0];
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    this.$err();
                })
            },
            getGoodsImg() {
                this.$http.get('api/getthumimages/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        this.gImg = res.body.message;
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    this.$err();
                })
            },
            addCart() {
                this.show = true;
                this.$store.commit('addGoods', {
                    id: parseInt(this.id),
                    cou: parseInt(this.cou),
                    price: parseInt(this.gContent.sell_price)
                })
            },
            toGoodsDesc(id) {
                // location.href = location.origin + '/#/home/goodsdesc/' + id;
                this.$router.push({name: 'goodsdesc', id});
            },
            beforeEnter(el) {
                el.style.transform = 'translate(0,0)';
                this.$top = this.$refs.count.getBoundingClientRect().top;
                this.$left = this.$refs.count.getBoundingClientRect().left;
                el.style.top = this.$top + 'px';
                el.style.left = this.$left + 'px';
            },
            enter(el, done) {
                // el.offsetWidth
                el.style.transition = 'all .5s cubic-bezier(.88,-0.24,.93,.94)';
                let badge = document.getElementById('badge').getBoundingClientRect();
                let x = badge.left - this.$left;
                let y = badge.top - this.$top;
                el.style.transform = `translate(${x}px,${y}px)`;
                done();
            },
            afterEnter() {
                this.show = !this.show;
            }
        },
        activated() {
            this.id = this.$route.params.id
            this.getGoodsContent();
            this.getGoodsImg();
        }
    }
</script>

<style lang="less" scoped>
    .gc {
        margin: 8px;

        .mui-card {
            margin: 8px 0;
        }

        .gc_desc {
            .mui-card-header {
                font-size: 15px;
                font-weight: bold;
            }

            .gc_price {
                span:first-of-type {
                    font-size: 12px;
                }

                span:last-of-type {
                    color: red;
                    font-size: 15px;
                }
            }

            .gc_num {
                margin-bottom: 10px;

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
        }
    }

    .ball {
        display: block;
        width: 20px;
        height: 20px;
        position: absolute;
        /*left: 126px;*/
        /*top: 353px;*/
        border-radius: 50%;
        background: red;
        z-index: 100;
    }
</style>