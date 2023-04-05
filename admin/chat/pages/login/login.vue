<template>
	<view class="login-box">
		<uni-section title="登录" type="line">
			<view>
				<uni-forms ref="form" :rules="rules" :modelValue="formData" validateTrigger="blur">
					<uni-forms-item label="用户名" required name="username">
						<uni-easyinput v-model="formData.username" placeholder="请输入用户名" />
					</uni-forms-item>
					<uni-forms-item label="密码" required name="password">
						<uni-easyinput v-model="formData.password" type="password" placeholder="请输入密码" />
					</uni-forms-item>
				</uni-forms>
				<button type="primary" @click="login">登录</button>
			</view>
		</uni-section>
	</view>
</template>

<script>
	import http from '../../http/http'
	import {mapMutations} from 'vuex'
	import {
		loginUrl,
		registerUrl
	} from '../../http/urls'
	import {chatSocket} from '../../socket/socket.js'
	export default {
		data() {
			return {
				rules: {
					username: {
						rules: [{
								required: true,
								errorMessage: '请输入用户名'
							},
							{
								minLength: 2,
								maxLength: 18,
								errorMessage: '长度在2-18之间'
							}
						]
					},
					password: {
						rules: [{
								required: true,
								errorMessage: '请输入密码'
							},
							{
								minLength: 6,
								maxLength: 18,
								errorMessage: '长度在6-18之间'
							}
						]
					}
				},
				formData: {
					username: '',
					password: ''
				}
			}
		},
		methods: {
			...mapMutations(['setUser']),
			login() {
				this.$refs.form.validate((err, data) => {
					if (err) return
					http.post(loginUrl, this.formData).then(r => {
						// #// #ifdef !H5
						uni.setStorageSync('cookies', r.cookies.map(v => v.split(';').filter(v => !['path',
							'expires', 'httponly'
						].includes(v.split('=')[0].trim()))).join(';'))
						// #endif
						this.setUser(r.data.data)
						uni.showToast({
							title: '登录成功'
						})
						chatSocket.connect()
						uni.switchTab({
							url: '/pages/message/message'
						})
					})
				})
			}
		},
	}
</script>

<style lang="scss">
	.login-box {
		padding: 30% 20rpx 0;
	}
</style>
