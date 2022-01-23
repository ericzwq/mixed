import {createApp} from 'vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
import LazyLoad from 'lazy-load-vue3'
import '@/assets/css/index.scss'
import '@/assets/css/public.scss'
import '@/assets/css/combination.scss'
import App from './App.vue'
import router from './router/router'
import store from './store/store'

const app = createApp(App)

app.use(LazyLoad, {component: true}).use(store).use(router).mount('#app')
