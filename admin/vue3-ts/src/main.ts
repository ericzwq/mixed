import {createApp} from 'vue'
import {ArrowDown} from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
import LazyLoad from './components/LazyLoad/index'
import '@/assets/css/index.scss'
import '@/assets/css/public.scss'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.component('arrow-down', ArrowDown)

app.use(LazyLoad).use(store).use(router).mount('#app')
