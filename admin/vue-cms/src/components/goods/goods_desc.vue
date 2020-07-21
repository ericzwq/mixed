<template>
    <div class="gd">
        <h3 class="gd_tit">{{ gDesc.title }}</h3>
        <div v-html="gDesc.content" class="gd_con"></div>
    </div>
</template>

<script>

    export default {
        name: "goods_desc",
        data() {
            return {
                gDesc: [],
                id: this.$route.params.id
            }
        },
        methods: {
            getGoodsDesc() {
                this.$http.get('api/goods/getdesc/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        this.gDesc = res.body.message[0];
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    this.$err();
                })
            },
        },
        created() {
            this.getGoodsDesc();
        }
    }
</script>

<style lang="less" scoped>
    .gd {
        padding: 0 5px;

        .gd_tit {
            font-size: 18px;
            text-align: center;
            padding: 10px 0;
        }

        .gd_con {
            /deep/ * {
                max-width: 100vw;
                margin-top: -1px; //移除图片间的间隙
            }

            /deep/ p {
                margin-bottom: 0;
            }

            /deep/ img {
                width: 100%;
                display: block;
                vertical-align: middle;
            }
        }
    }
</style>