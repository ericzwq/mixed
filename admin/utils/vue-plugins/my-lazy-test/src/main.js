import Vue from 'vue'
import App from './App.vue'
import {Table, TableColumn} from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import Lazy from "./Lazy";
// import VueLazyload from "vue-lazyload";
import loadingPicSrc from './assets/loading.png'

Vue.config.productionTip = false
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Lazy, {loadingPicSrc})
// Vue.use(VueLazyload, {loading: loadingPicSrc})
new Vue({
  render: h => h(App)
}).$mount('#app')
