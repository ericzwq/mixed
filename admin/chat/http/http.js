import { DOMAIN } from "../consts/consts.js"
import {chatSocket} from "../socket/socket.js"

const request = (url, method, data, config) => new Promise((resolve, reject) => {
	const header = {}
	// #ifdef !H5
	header.cookie = uni.getStorageSync('cookies')
	console.log(header)
	// #endif
	return uni.request({
		url: `https://${DOMAIN}:8080/api/${url}`,
		data,
		method,
		header,
		fail(e) {
			console.log(e)
			uni.showToast({
				title: '网络异常',
				duration: 2000,
				icon: 'error'
			})
			reject(e)
		},
		success(r) {
			if (r.data.status !== 0) {
				reject(r)
				if (r.data.status === 401) {
					chatSocket.close('未登录关闭连接')
					return uni.navigateTo({
						url: '/pages/login/login'
					})
				} else {
					return uni.showToast({
						title: r.data.message,
						duration: 2000,
						icon: "error"
					})
				}
			}
			resolve(r)
		},
		...config,
	})
})
export default {
	get: (url, data, config) => request(url, 'GET', data, config),
	post: (url, data, config) => request(url, 'POST', data, config),
}
