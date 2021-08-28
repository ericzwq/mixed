import axios from 'axios';
// import qs from 'qs'
// import { getCookie } from '../common/utool'
axios.defaults.withCredentials = true;
// axios.defaults.timeout = 10000
// var url = ''
// var url = 'https://haiyingshuju.com'
// var url = 'https://ext.haiyingshuju.com'
var url = 'https://106.75.247.94'
// var url = '/api'

// 如果token在cookie中存在，则将其放入请求头
// if (getCookie('token') !== '') {
//     axios.defaults.headers.common['token'] = getCookie('token')
// }

const http = axios.create({
    baseURL: url
})

// http.interceptors.response.use(response => {
//     // console.log(store)
//     let token = store.state.User.token
//     if (response.data.code === 401 && token === '') {
//         router.push({
//             path: '/login'
//         })
//     } else if (response.data.code === 401 && token) {
//         console.log('刷新token')
//         store.dispatch('GET_USER_INFO')
//     } else if (response.data.code === 501) {
//         router.push({
//             path: '/personPage/recharge',
//             uid: 9
//         })
//     }
//     return response
// })

export default http
