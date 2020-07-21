import $ from 'jquery';
import './css/index.css';
import './css/scss.scss';
import 'bootstrap/dist/css/bootstrap.css';
// import '../node_modules/bootstrap/dist/css/bootstrap.css' node_modules可以省略
import Vue from 'vue';
import vueRouter from 'vue-router';
import test, {exportMes} from './vue/test.vue';
import router from "./router/router.js";
import App from "./js/App.vue";
Vue.use(vueRouter)
console.log(test, exportMes)
$(function () {
    $('li:even').css({background: 'green'});
    $('li:odd').css({background: 'blue'});
})

class Person { //ES6
    static info = {name: 'ss', age: 45}
}

let com1 = Vue.component('aa', {
    template: '<h1>h1qq</h1>'
})
console.log(Person.info)
let vm1 = new Vue({
    el: '#app',
    data: {
        mes: '22'
    },
    methods: {},
    render: c => c(test) // 只能通过加载.vue文件形式创建
});

let vm2 = new Vue({
    el: '#app-router',
    router,
    render: c => c(App)
})