import VueRouter from 'vue-router';
// import home from './components/tabbar/home.vue';
// import cart from './components/tabbar/cart.vue';
// import user from './components/tabbar/user.vue';
// import search from './components/tabbar/search.vue';
// import home_newslist from './components/news/home_newsList.vue';
// import news_content from './components/news/news_content.vue';
// import home_photoList from './components/photo/home_photoList.vue';
// import photo_content from './components/photo/photo_content.vue';
// import home_goodslist from './components/goods/home_goodslist.vue';
// import goods_content from './components/goods/goods_content.vue';
// import goods_desc from './components/goods/goods_desc.vue';
// import noPage from './components/common/noPage.vue';

let router = new VueRouter({
    // mode:'history',
    routes: [
        {path: '/', redirect: '/home'},
        {
            path: '/home', component: () => import('./components/tabbar/home.vue'),
            beforeEnter: (to, from, next) => {
                next()
            },
            name: 'home',
            alias: '/index',
            meta: {aa: 111},//元信息
            aa: {cc: 22},//无效
        },
        {path: '/cart', component: () => import('./components/tabbar/cart.vue')},
        {path: '/user', component: () => import('./components/tabbar/user.vue')},
        {path: '/search', component: () => import('./components/tabbar/search.vue')},
        {path: '/home/newslist', component: () => import('./components/news/home_newsList.vue')},
        {path: '/home/newscontent/:id', component: () => import('./components/news/news_content.vue')},
        {path: '/home/photolist/', component: () => import('./components/photo/home_photoList.vue')},
        {path: '/home/photocontent/:id', component: () => import('./components/photo/photo_content.vue')},
        {path: '/home/goodslist', component: () => import('./components/goods/home_goodslist.vue')},
        {path: '/home/goodscontent/:id', component: () => import('./components/goods/goods_content.vue')},
        {path: '/home/goodsdesc/:id', component: () => import('./components/goods/goods_desc.vue'), name: 'goodsdesc'},
        {path: '*', component: () => import('./components/common/noPage.vue')}
    ],
    linkActiveClass: 'mui-active',
});
router.beforeEach((to, from, next) => {
    next();
});
router.afterEach(((to, from) => {
    // console.log(to)
    // console.log(from)
}));
router.onError((a) => {
    console.log(a)
})
console.log(router)
export default router;