<template>
    <div class="pho">
        <keep-alive>
            <div class="mui-scroll-wrapper mui-slider-indicator mui-segmented-control mui-segmented-control-inverted"
                 id="pho_scroll">
                <div class="mui-scroll" @scroll.passive="scrollHandler($event)">
                    <a :class="'mui-control-item' + (id === i.id.toString() ? ' mui-active' : '')"
                       v-for="i in cateList" :key="i.id" @tap="getPhotoList(i.id)">{{ i.title }}
                    </a>
                </div>
            </div>
        </keep-alive>
        <ul class="pho_list">
            <router-link class="mui-card-footer" v-for="i in photoList" :key="i.id" :to="'/home/photocontent/' + i.id"
                         tag="li" v-cloak>
                <img v-lazy="i.img_url" :key="i.img_url">
                <div class="list_text">
                    <h4 class="list_title">{{ i.title }}</h4>
                    <div class="list_cont">{{ i.zhaiyao }}</div>
                </div>
            </router-link>
        </ul>
        <p class="lastP" v-if="!noData">此分类暂无数据，期待您的美照</p>
    </div>
</template>

<script>
    import mui from '../../../lib/mui/js/mui.min.js';

    export default {
        name: "home_photoList",
        data() {
            return {
                cateList: [],
                photoList: [],
                noData: false,
                id: localStorage.getItem('id') || '0',
                p: localStorage.getItem('p'), //the position of the tab bar scroll
                timer: null
            }
        },
        methods: {
            getCateList() {
                this.$http.get('api/getimgcategory').then(function (res) {
                    let list = res.body.message;
                    if (res.body.status === 0) {
                        list.unshift({title: '全部', id: 0});
                        this.cateList = list;
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                })
            },
            getPhotoList(id) {
                localStorage.setItem('id',id);
                this.$indicator.open('玩命加载中...');
                this.$http.get('api/getimages/' + id).then(function (res) {
                    if (res.body.status === 0) {
                        this.photoList = res.body.message;
                        this.noData = this.photoList.length;
                        this.$indicator.close();
                    } else {
                        this.$err();
                    }
                }, function (err) {
                    console.log(err);
                    this.$err();
                })
            },
            scrollHandler(e) {
                /*record the scroll position,can retain last position when refresh and use function debounce(函数防抖)*/
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    let scrPos = e.target.style.transform; // srcPos --> the scroll container's position
                    let start = scrPos.indexOf('(');
                    let end = scrPos.indexOf(',');
                    let newPos = parseInt(scrPos.substring(start + 1, end + 1));
                    localStorage.setItem('p', newPos.toString());
                }, 250)
            }
        },
        mounted() {
            mui('.mui-scroll-wrapper').scroll().scrollTo(parseInt(this.p), 0, 0);
            this.getCateList();
            this.getPhotoList(this.id);
        }
    }
</script>

<style lang="less" scoped>
    * {
        /*touch-action: pan-y;*/
    }

    .mui-segmented-control.mui-segmented-control-inverted .mui-control-item.mui-active {
        border: none;
    }

    .pho {
        .pho_list {
            padding: 10px;
            margin: 0;

            li {
                height: calc(100vw - 20px);
                position: relative;
                list-style-type: none;
                padding: 0;
                margin-bottom: 10px;
                background: #ccc;
                box-shadow: 0 0 5px #999;
                text-align: center;

                img {
                    width: 100%;
                    height: 100%;
                }

                img[lazy=loading] {
                    height: calc(100vw - 20px);
                }

                .list_text {
                    position: absolute;
                    bottom: 0;
                    color: #fff;
                    padding: 0 4px;
                    background: rgba(0, 0, 0, .4);

                    .list_title, .list_cont {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                    }

                    .list_title {
                        -webkit-line-clamp: 1;
                        -ms-hyphenate-limit-lines: 1;
                        font-size: 14px;
                    }

                    .list_cont {
                        font-size: 12px;
                        max-height: 60px;
                        -webkit-line-clamp: 2;
                        -ms-hyphenate-limit-lines: 2;
                    }
                }

                .lastP {
                    margin-top: 200px;
                }
            }

            @media (min-width: 750px) {
                li {
                    width: 48%;
                    height: calc(48vw - 1%);
                    float: left;
                    margin: 1%;

                    img {
                        width: 100%;
                    }

                    img[lazy=loading] {
                        height: calc(48vw - 1%);
                    }
                }
            }
        }
    }
</style>