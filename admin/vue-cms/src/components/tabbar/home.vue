<template>
    <div class="cms_home">
        <!--轮播图-->
        <slider :list="list" :is-full="true"></slider>
        <!--导航栏-->
        <nav class="clearFix">
            <router-link to="/home/newslist"><img src="../../images/menu1.png"><span>新闻资讯</span></router-link>
            <router-link to="/home/photolist"><img src="../../images/menu2.png"><span>图片分享</span></router-link>
            <router-link to="/home/goodslist"><img src="../../images/menu3.png"><span>商品购买</span></router-link>
            <a><img src="../../images/menu4.png"><span>留言反馈</span></a>
            <a><img src="../../images/menu5.png"><span>视频专区</span></a>
            <a><img src="../../images/menu6.png"><span>联系我们</span></a>
        </nav>
    </div>
</template>

<script>
    import slider from "../common/slider.vue";
    export default {
        components:{slider},
        data() {
            return {
                list: '',
            }
        },
        methods: {
            getBanner() {
                this.$indicator.open('玩命加载中...');
                this.$http.get('api/getlunbo').then(function (res) {
                    if (res.body.status === 0) {
                        this.list = res.body.message;
                        this.$indicator.close();
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                })
            }
        },
        created() {
            this.getBanner();
        }
    }
</script>

<style lang="less" scoped>
    .cms_home {
        height: 200px;

        img {
            width: 100%;
            height: 100%;
        }

        nav {
            background: #fff;

            a {
                width: 33%;
                float: left;
                text-align: center;
                color: #000;
                padding: 10px 0;
                font-size: 12px;

                img {
                    width: 50px;
                    height: 50px;
                    display: block;
                    margin: 10px auto;
                }
            }
        }
    }

    @media screen and (min-width: 750px) {
        .cms_home {
            height: 300px;
        }
    }
</style>