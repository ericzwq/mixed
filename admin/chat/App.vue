<script>
	import {
		mapMutations
	} from 'vuex'
	import http from './http/http.js'
	import {
		getContactsUrl
	} from './http/urls.js'
	import {chatSocket} from './socket/socket.js'
	export default {
		onLaunch: function() {
			chatSocket.connect()
			this.getUser()
			this.getContacts()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			...mapMutations(['setContacts', 'setUser']),
			// 获取用户信息
			getUser() {
				const user = uni.getStorageSync('user')
				if (!user) {
					chatSocket.close()
					return uni.navigateTo({
						url: '/pages/login/login'
					})
				}
				this.setUser(JSON.parse(user))
			},
			// 获取通讯录
			getContacts() {
				let contacts = uni.getStorageSync('contacts')
				if (!contacts) {
					http.get(getContactsUrl).then(r => {
						const {
							data
						} = r.data
						uni.setStorageSync('contacts', JSON.stringify(data))
						this.setContacts(data)
					})
				} else {
					this.setContacts(JSON.parse(contacts))
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
