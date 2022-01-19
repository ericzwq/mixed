import {createApp} from 'vue'
import {ArrowDown} from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
// import LazyLoad from './components/LazyLoad/index'
import LazyLoad, {listener, config} from 'lazy-load-vue3'
// import LazyLoad from 'vue3-lazyload/dist/vue3-lazyload.esm.js'
import '@/assets/css/index.scss'
import '@/assets/css/public.scss'
import '@/assets/css/combination.scss'
import App from './App.vue'
import router from './router/router'
import store from './store/store'

const app = createApp(App)

app.component('arrow-down', ArrowDown)
console.dir(LazyLoad)
console.log({listener, config})
app.use(LazyLoad, {component: true}).use(store).use(router).mount('#app')
