// 无法通过标签形式导入elementui 样式
let element_css = document.createElement('link');
element_css.href = 'https://unpkg.com/element-ui@2.8.2/lib/theme-chalk/index.css' 
element_css.rel = "stylesheet" 
document.head.append(element_css)


import Vue from "vue";
import AppComponent from "./App/App.vue";
import VueSweetalert2 from '../plugins/vue-sweetalert2'
import { Dialog, Input, Button, Row, Col} from 'element-ui';
Vue.use(Dialog)
Vue.use(Input)
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(VueSweetalert2)

Vue.component("app-component", AppComponent);

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  }
});
