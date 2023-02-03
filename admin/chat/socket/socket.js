import {
	DOMAIN
} from "../consts/consts"

export const chatSocket = createSocket()
export const voiceSocket = createSocket()

function createSocket() {
	let connected = false
	return {
		socketTask: null,
		connect(url = '') {
			if (connected) return
			const header = {}
			// #ifdef !H5
			header.cookie = uni.getStorageSync('cookies')
			console.log(header)
			// #endif
			const socketTask = uni.connectSocket({
				url: `wss://${DOMAIN}:8080/ws-api${url}`,
				header,
				success() {}
			})
			this.socketTask = socketTask
			socketTask.onOpen(r => {
				console.log('建立socket连接', url, r)
				connected = true
			})
			socketTask.onError(r => {
				uni.showToast({
					title: '网络异常',
					duration: 2000,
					icon: 'error'
				})
				console.log('socket连接异常', r)
			})
			socketTask.onMessage(({
				data
			}) => {
				try {
					data = JSON.parse(data)
				} catch (e) {}
				if (data.status !== 0) {
					if (data.status === 401) {
						this.close('未登录关闭连接')
						uni.navigateTo({
							url: '/pages/login/login'
						})
					} else {
						uni.showToast({
							title: data.message || '网络异常',
							duration: 2000,
							icon: "error"
						})
					}
				} else {
					this.messageHandlers.forEach(v => v(data))
				}
			})
			socketTask.onClose(r => {
				console.log('socket连接关闭', url, r)
				connected = false
			})
		},
		messageHandlers: [],
		close(reason) {
			console.log('关闭socket连接', reason)
			this.socketTask?.close({
				reason
			})
			connected = false
		},
		send(data) {
			return new Promise((resolve, reject) => {
				this.socketTask.send({
					data: JSON.stringify(data),
					fail(e) {
						console.log(e)
						uni.showToast({
							title: '发送失败',
							duration: 2000,
							icon: 'error'
						})
						reject(e)
					},
					success: resolve
				})
			})
		}
	}
}
