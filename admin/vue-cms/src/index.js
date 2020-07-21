import Vue from 'vue';
import VueRouter from 'vue-router';
import router from './router.js';
import {Header, Swipe, SwipeItem, Toast, Button, Spinner, Indicator, Lazyload, InfiniteScroll, Switch} from 'mint-ui';
import 'mint-ui/lib/style.css';
import '../lib/mui/css/mui.min.css';
import '../lib/mui/css/icons-extra.css';
import './css/index.css';
import mui from '../lib/mui/js/mui.min.js';
import app from './App.vue';
import vueResource from 'vue-resource';
import moment from 'moment';//时间格式化插件
// import MintUI, {Toast, Indicator,InfiniteScroll} from 'mint-ui';
import vuePreview from 'vue-preview';
import Vuex from 'vuex';

Vue.prototype.$mui = mui;
Vue.filter('dataFormat', function (data, pattern = 'YYYY-MM-DD HH:mm:ss') {
    return moment(data).format(pattern);
});
Vue.prototype.$toast = Toast;
Vue.prototype.$indicator = Indicator;
Vue.prototype.$err = function () {
    Indicator.close();
    Toast('服务繁忙');
};
Vue.use(VueRouter);
Vue.use(vueResource);
Vue.use(Lazyload, {
    loading: require('./images/loading.gif'),
    attempt: 1,
    preLoad: 1.3
})
// Vue.use(MintUI);
Vue.use(vuePreview, {
    barsSize: {top: 0, bottom: 0},
    captionEl: true,
    fullscreenEl: true,
    shareEl: false,
    bgOpacity: 0.85,
    tapToClose: true,
    tapToToggleControls: true
});
Vue.use(InfiniteScroll);
// import 'mint-ui/lib/style.css';
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        count: parseInt(localStorage.getItem('count')) || 0,//总数
        data: JSON.parse(localStorage.getItem('data')) || [],
        index: -1,//通过id获取的索引值
        totalMoney: parseInt(localStorage.getItem('money')) || 0
    },
    mutations: {
        getIndexById(state, id) {
            state.index = -1;//遍历前重置
            state.data.forEach((v, i) => {
                if (v.id === parseInt(id)) return state.index = i;
            });
        },
        saveData(state) {
            localStorage.setItem('count', state.count);
            localStorage.setItem('data', JSON.stringify(state.data));
            localStorage.setItem('money', state.totalMoney.toString());
        },
        addGoods(state, data) { //data{ id,cou,selected,price }
            this.commit('getIndexById', data.id);
            if (state.index > -1) { //已存在该商品，直接更改数量 data{ id,cou }
                this.commit('updateNum', data);
            } else { //添加 data{ id,cou,selected,price }
                state.data.unshift({id: data.id, cou: data.cou, selected: true, price: data.price});
                state.totalMoney += data.price * data.cou;
                state.count += data.cou;
                this.commit('saveData', state);
            }
        },
        updateNum(state, data) { //data { cou,id }
            let item = state.data[state.index];
            let oldNum = item.cou;
            item.cou = data.cou;
            state.count = state.count - oldNum + item.cou;
            if (item.selected) state.totalMoney += (item.cou - oldNum) * item.price;
            this.commit('saveData', state);
        },
        updateState(state, data) { // data { id,selected }
            this.commit('getIndexById', data.id);
            let item = state.data[state.index];
            if (state.index < 0) return Toast('操作错误！');
            item.selected = data.selected;
            if (data.selected) state.totalMoney += item.cou * item.price;
            if (!data.selected) state.totalMoney -= item.cou * item.price;
            this.commit('saveData', state);
        },
        deleteGoods(state, id) { // id
            if (!state.data.length) return;
            this.commit('getIndexById', id);
            let item = state.data[state.index];
            state.count -= state.data[state.index].cou;
            if (item.selected) state.totalMoney -= item.cou * item.price;
            state.data.splice(state.index, 1);
            this.commit('saveData', state);
        }
    },
    getters: { //另一种方法
        // getAllCount(state) {
        //     var c = 0;
        //     state.car.forEach(item => {
        //         c += item.count
        //     })
        //     return c
        // },
        // getGoodsCount(state) {
        //     var o = {}
        //     state.car.forEach(item => {
        //         o[item.id] = item.count
        //     })
        //     return o
        // },
        // getGoodsSelected(state) {
        //     var o = {}
        //     state.car.forEach(item => {
        //         o[item.id] = item.selected
        //     })
        //     return o
        // },
        // getGoodsCountAndAmount(state) {
        //     var o = {
        //         count: 0, // 勾选的数量
        //         amount: 0 // 勾选的总价
        //     }
        //     state.car.forEach(item => {
        //         if (item.selected) {
        //             o.count += item.count
        //             o.amount += item.price * item.count
        //         }
        //     })
        //     return o
        // }
    }
})
Vue.http.options.root = 'http://api.cms.liulongbin.top';
Vue.http.options.emulateJSON = 'application/x-www-urlencoded';
Vue.component(Header.name, Header);
Vue.component(Swipe.name, Swipe);
Vue.component(SwipeItem.name, SwipeItem);
Vue.component(Button.name, Button);
Vue.component(Spinner.name, Spinner);
Vue.component(Switch.name, Switch);
let vm = new Vue({
    el: '#app',
    router,
    data: {},
    render: c => c(app),
    store,
})