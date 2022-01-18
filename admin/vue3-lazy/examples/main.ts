import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import LazyLoad from '~/index'
import App from './App.vue'

createApp(App).use(ElementPlus).use(LazyLoad, {component: true}).mount('#app')
