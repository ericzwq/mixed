<template>
    <div class="cm_box" ref="scr">
        <p>评论：</p>
        <div class="mui-input-row" style="margin: 10px 5px;">
            <textarea id="textarea" rows="3" placeholder="请输入您要BB的内容，最多BB120字" v-model="content"
                      @keydown.enter="postComment"></textarea>
        </div>
        <button type="button" class="mui-btn mui-btn-primary mui-btn-block" @click="postComment">发表评论</button>
        <p class="lastP" style="color: #000;padding-bottom: 10px;" v-if="!comments.length">
            暂无人BB~~，期待您的BB</p>
        <div class="cm_con" v-for="i in comments" v-if="comments.length">
            <a>{{ i.user_name }}</a>
            <p>{{ i.content }}</p>
            <span>{{ i.add_time | dataFormat }}</span>
        </div>
        <div class="cm_more" v-show="showSpinner">正在为您加载更多内容<span class="mui-spinner"></span></div>
        <p class="lastP" v-show="comments.length && !showSpinner">没有更多内容了，期待您的BB</p>
    </div>
</template>

<script>
    export default {
        name: "comments",
        props: ['id', 'height'],
        data() {
            return {
                comments: [],
                pageIndex: 1,
                content: '',
                hasMore: true,
                showSpinner: false,
            }
        },
        methods: {
            getComments() {
                if (!this.hasMore) return this.showSpinner = false;
                this.$indicator.open('玩命加载中...');
                this.$http.get('api/getcomments/' + this.id + '?pageindex=' + this.pageIndex).then(function (res) {
                    if (res.body.status === 0) {
                        this.comments = this.comments.concat(res.body.message);
                        this.$indicator.close();
                        this.hasMore = res.body.message.length >= 10;
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                });
            },
            postComment() {
                if (!this.content) return this.$toast('亲，内容不能为空哦');
                this.$indicator.open('玩命提交中...');
                this.$http.post('api/postcomment/' + this.id, {content: this.content}).then(function (res) {
                    if (res.body.status === 0) {
                        this.$indicator.close();
                        this.comments.unshift({content: this.content, user_name: '匿名用户', add_time: Date.now()})
                        this.$toast('评论成功');
                        this.content = '';
                    } else {
                        this.$err();
                        console.log(res)
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                })
            }
        },
        created() {
            this.getComments();
            /*slide up to load more data*/
            let timer = null;
            window.addEventListener('scroll', (e) => {
                if (!this.comments.length || !this.hasMore) return this.showSpinner = false;
                clearTimeout(timer);
                timer = setTimeout(() => {
                    //if no comments is not necessary to load more data
                    this.$emit('getHeight');
                    this.$nextTick(()=>{
                      if (!this || !this.$refs.scr || !this.height) return;
                      let s = e.target;
                      if (s.scrollTop + s.clientHeight - 90 + 24 >= this.height) {
                        //24 is the spinner-icon's height,90 is the container's padding
                        this.pageIndex++;
                        this.showSpinner = true;
                        this.getComments();
                      }
                    })
                }, 250)
            }, true)

        }
    }
</script>

<style lang="less" scoped>
    .cm_box {
        margin-top: 10px;
        padding: 5px 5px 0;
        background: #fff;

        p:first-of-type {
            font-weight: 700;
            color: #000;
            font-size: 16px;
        }

        div {
            textarea {
                font-size: 12px;
            }
        }

        .cm_con {
            font-size: 12px;
            background: #fee;
            padding: 5px;
            margin-top: 10px;

            p {
                font-size: 16px;
                margin-bottom: 0;
                font-weight: 400;
            }
        }

        .cm_more {
            display: flex;
            justify-content: center;
            font-size: 12px;
            line-height: 24px;

            span {
                width: 15px
            }
        }
    }
</style>
