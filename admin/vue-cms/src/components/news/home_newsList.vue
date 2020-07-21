<template>
    <div>
        <ul class="mui-table-view">
            <li class="mui-table-view-cell mui-media" v-for="i in newsList" :key="i.id">
                <router-link :to="'/home/newscontent/'+i.id">
                    <img class="mui-media-object mui-pull-left" :src="i.img_url">
                    <div class="mui-media-body">
                        <p class="mui-ellipsis">{{ i.title }}</p>
                        <p class="newslist_info">
                            <span>发表时间：{{ i.add_time | dataFormat}}</span>
                            <span>点击：{{i.click}}次</span>
                        </p>
                    </div>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "home_newslist",
        data() {
            return {newsList: ''}
        },
        methods: {
            getNewsList() {
                this.$indicator.open('玩命加载中...');
                this.$http.get('api/getnewslist').then(function (res) {
                    if (res.body.status === 0) {
                        this.newsList = res.body.message;
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
            this.getNewsList();
        }
    }
</script>

<style lang="less" scoped>
    p {
        font-size: 15px;
        font-weight: bold;
        color: #000;
    }

    .mui-table-view {
        .newslist_info {
            display: flex;
            justify-content: space-between;
            color: #007aff;
            font-size: 12px;
        }
    }
</style>