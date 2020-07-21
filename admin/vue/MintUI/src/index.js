import Vue from 'vue';
import {Header, Button } from 'mint-ui';
// import 'mint-ui/lib/style.css';
import App from './App.vue';
import {Indicator} from 'mint-ui';

Vue.component(Button.name, Button);
Vue.component(Header.name, Header);
// Vue.use(Button);
new Vue({
    el: '#app',
    render: c => c(App),
    // template:'<App></App>',
    components: {App}
})
Indicator.open({
    text: '加载中...',
    spinnerType: 'triple-bounce'
});
setTimeout(function () {
    Indicator.close();
}, 2000)