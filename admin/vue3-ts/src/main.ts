import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueLazyload from 'vue3-lazyload'
import '@/assets/css/index.scss'
import '@/assets/css/public.scss'
import router from './router'
import store from './store'
import App from './App.vue'
import http from './http'

const app = createApp(App)

app.use(ElementPlus)

app.use(VueLazyload, {
  preLoad: 1.3,
  attempt: 1,
  lazyComponent: true
});
app.config.globalProperties.$http = http

app.use(store).use(router).mount('#app')
