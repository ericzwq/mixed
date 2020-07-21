<template>
    <div class="nc" ref="scr">
        <p class="nc_tit">{{ newsContent.title }}</p>
        <p class="nc_info">
            <span>发表时间：{{ newsContent.add_time | dataFormat}}</span><span>点击：{{ newsContent.click }}次</span></p>
        <hr>
        <div v-html="newsContent.content" class="nc_con"></div>
        <comments :id="this.id" :height="height" @getHeight="getHeight"></comments>
    </div>
</template>
<script>
    import comments from "../common/comments.vue";

    export default {
        name: "news_content",
        data() {
            return {
                newsContent: '',
                id: this.$route.params.id,
                height: 0
            }
        },
        methods: {
            getNewsContent() {
                // this.$indicator.open('玩命加载中...'); let sub component(comments) to start the indicator
                this.$http.get('api/getnew/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        this.newsContent = res.body.message[0];
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                });
            },
            getHeight() {
                if (!this && !this.$refs.scr) return;
                this.height = this.$refs.scr.clientHeight;
            }
        },
        components: {comments},
        created() {
            this.getNewsContent();
        }
    }
</script>

<style lang="less" scoped>
    .nc {
        background: #fff;
        padding: 20px 4px 0;

        .nc_tit {
            color: red;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
        }

        hr {
            height: 1px;
            border: none;
            background: #ccc;
        }

        .nc_info {
            color: #007aff;
            display: flex;
            justify-content: space-between;
        }
    }
</style>

<style scoped>
    /*.nc {*/
    .nc_con >>> p:last-of-type {
        /*作用于scoped属性的样式vue会解析为带有自定义属性data的类名，如data-v-abc123，所以某些第三方插件在运行中动态添加类时其样式将不会生效，
        有2种解决方案：
        1.在有scoped作用下的style用 >>> 深度选择器，但是在less或scss中可能会渲染失败；
        1.新建一个不含scoped的style标签*/
        margin-bottom: 0;
    }

    /*}*/
    /*}*/
</style>