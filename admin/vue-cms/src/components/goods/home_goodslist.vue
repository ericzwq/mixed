<template>
    <div>
        <div class="gl clearFix" v-infinite-scroll="loadMore" infinite-scroll-disabled="50"
             :infinite-scroll-disabled="!hasMore">
            <router-link v-for="i in goodsList" :key="i.id + Math.random()" class="gl_list"
                         :to="'/home/goodscontent/' + i.id">
                <img v-lazy="i.img_url" alt="暂时没有图片哦" :key="i.img_url">
                <h4 class="gl_tit">{{ i.title }}</h4>
                <div class="gl_info">
                    <p class="gl_price"><span>&yen;{{ i.market_price }}</span>
                        <del>&yen;{{ i.sell_price }}</del>
                    </p>
                    <p class="gl_num lastP"><span>热卖中</span> <span>剩{{ i.stock_quantity }}件</span></p>
                </div>
            </router-link>
        </div>
        <div class="gl_more" v-show="isLoading">正在为您加载更多内容<span class="mui-spinner"></span></div>
        <p class="lastP" v-show="goodsList.length && !isLoading">没有更多内容了</p>
    </div>
</template>

<script>
    export default {
        name: "goodslist",
        data() {
            return {
                page: 1,
                goodsList: [],
                isLoading: false,
                hasMore: true
            }
        },
        methods: {
            getGoodsList() {
                if (this.isLoading || !this.hasMore) return;
                this.$http.get('api/getgoods?pageindex=' + this.page).then(function (res) {
                    if (res.body.status === 0) {
                        if (res.body.message.length < 10) this.hasMore = false;
                        this.goodsList = this.goodsList.concat(res.body.message);
                        this.isLoading = false;
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    this.$err();
                })
            },
            loadMore() {
                if (this.isLoading) return;
                this.getGoodsList();
                this.page++;
            },
        },
    }
</script>

<style lang="less" scoped>
    .gl {
        padding: 0 4px 10px;

        .gl_list {
            width: 48%;
            display: block;
            box-shadow: 0 0 6px #999;
            margin: 10px 1% 0;
            float: left;
            /*min-height: 75vw;*/

            img {
                width: 100%;
                height: 100%;
            }

            img[lazy=loading] {
                height: calc(48vw - 8px);
            }

            .gl_tit {
                margin-top: -5px;
                margin-bottom: 0;
                padding: 0 5px 5px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                background: #fff;
                color: #000;
                font-size: 12px;
            }

            .gl_info {
                padding: 5px;
                background: #ddd;

                .gl_price {

                    span {
                        color: red;
                        margin-right: 20px;
                        font-size: 16px;
                    }
                }

                .gl_num {
                    display: flex;
                    justify-content: space-between;
                }
            }
        }
    }
</style>