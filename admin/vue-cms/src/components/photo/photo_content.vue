<template>
    <div class="pc">
        <h4 class="pc_tit">{{ pContent.title }}</h4>
        <p class="pc_time_click">
            <span>发表时间：{{ pContent.add_time | dataFormat }}</span><span>点击：{{ pContent.click }}次</span></p>
        <hr/>
        <vue-preview class="pc_thumb" :slides="thumbnails"></vue-preview>
        <div class="pc_con" v-html="pContent.content"></div>
        <comments :id="id"></comments>
    </div>
</template>

<script>
    import comments from "../common/comments.vue";

    export default {
        name: "photo_content",
        components: {comments},
        data() {
            return {
                id: this.$route.params.id,
                pContent: {},
                thumbnails: [],
            }
        },
        methods: {
            getPhotoContent() {
                this.$http.get('api/getimageInfo/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        this.pContent = res.body.message[0];
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                })
            },
            getThumbnails() {
                this.$http.get('api/getthumimages/' + this.id).then(function (res) {
                    if (res.body.status === 0) {
                        res.body.message.forEach(function (i) {
                            i.msrc = i.src;
                            i.w = 500;
                            i.h = 500;
                        });
                        this.thumbnails = res.body.message;
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
            /*to resolve the vue-preview refresh bug*/
            if (location.href.indexOf('&') > -1) {
                location.href = location.href.substring(0, location.href.indexOf('&'));
                history.back();
            }
            this.getPhotoContent();
            this.getThumbnails();
        }
    }
</script>

<style lang="less" scoped>
    .pc {
        padding: 10px 4px 0;

        .pc_tit {
            color: #007aff;
            font-size: 15px;
            text-align: center;
        }

        .pc_time_click {
            display: flex;
            justify-content: space-between;
        }

        .pc_thumb {
            /deep/ .my-gallery:after {
                content: '';
                clear: both;
                display: block;
            }

            /deep/ .my-gallery {

                figure {
                    width: 30%;
                    float: left;
                    margin: 5px 0 5px 2.5%;

                    img {
                        width: 100%;
                    }
                }
            }
        }

        .pc_con {
            font-size: 12px;
        }
    }
</style>