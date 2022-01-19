import {createApp} from 'vue'
import ElementPlus, {ElAffix} from 'element-plus'
import 'element-plus/dist/index.css'
// import LazyLoad from '~/lazy-load-vue3.esm.js'
import LazyLoad from '../src/index'
import App from './App.vue'

console.dir(ElAffix)
// console.dir(LazyLoad)
createApp(App).use(ElementPlus).use(LazyLoad, {component: true}).mount('#app')
