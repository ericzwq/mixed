import {createApp} from 'vue'
// import E from 'element-plus'
// import 'element-plus/dist/index.css'
// import {
//   ElTable, ElTableColumn, ElTabPane, ElMenu, ElMenuItem, ElIcon, ElDropdownItem, ElButton, ElConfigProvider, ElDialog
//   , ElAvatar, ElDropdownMenu, ElRadioButton, ElInput, ElDropdown, ElRadioGroup, ElTooltip, ElPopover, ElSelect, ElOption, ElForm, ElFormItem, ElRadio, ElTabs, ElPagination, ElLoading
// } from "element-plus";
import {ElLoading} from "element-plus";
// import 'element-plus/theme-chalk/el-loading.css'
// import 'element-plus/theme-chalk/el-message-box.css'
// import 'element-plus/theme-chalk/el-message.css'
import LazyLoad from 'lazy-load-vue3'
import '@/assets/css/index.scss'
import '@/assets/css/public.scss'
import '@/assets/css/combination.scss'
import App from './App.vue'
import router from './router/router'
import store from './store/store'

const app = createApp(App)
// app.use(ElTable)
// app.use(ElTableColumn)
// app.use(ElTabPane)
// app.use(ElMenu)
// app.use(ElMenuItem)
// app.use(ElIcon)
// app.use(ElDropdownItem)
// app.use(ElButton)
// app.use(ElConfigProvider)
// app.use(ElDialog)
// app.use(ElAvatar)
// app.use(ElDropdownMenu)
// app.use(ElRadioButton)
// app.use(ElInput)
// app.use(ElDropdown)
// app.use(ElRadioGroup)
// app.use(ElTooltip)
// app.use(ElPopover)
// app.use(ElSelect)
// app.use(ElOption)
// app.use(ElForm)
// app.use(ElFormItem)
// app.use(ElRadio)
// app.use(ElTabs)
// app.use(ElPagination)
app.use(ElLoading)
app.use(LazyLoad, {component: true}).use(store).use(router).mount('#app')
