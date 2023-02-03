<template>
	<view class="personal-box">
		<view class="header">
			<image src="../../static/logo.png"></image>
			<view class="right">
				<text class="nickname">淡定</text>
				<view class="id-box">
					<text>天聊号： zwq15297795295</text>
					<view>
						<text>&gt;</text>
					</view>
				</view>
			</view>
		</view>
		<view class="footer">
			<text @click="logout">退出登录</text>
		</view>
	</view>
</template>

<script>
	import http from '../../http/http'
	import {
		logoutUrl
	} from '../../http/urls'
import {chatSocket} from '../../socket/socket.js'
	export default {
		data() {
			return {

			}
		},
		methods: {
			logout() {
				http.post(logoutUrl).then(r => {
					chatSocket.close()
					uni.navigateTo({
						url: '/pages/login/login'
					})
					uni.removeStorageSync('user')
				})
			}
		}
	}
</script>

<style lang="scss">
	.personal-box {
		padding: 0 20rpx;

		.header {
			height: 120rpx;
			display: flex;
		}

		image {
			display: block;
			height: 80rpx;
			width: 80rpx;
			margin: 20rpx;
			border-radius: 8rpx;
		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			flex-grow: 1;
		}

		.nickname {
			font-weight: 700;
		}

		.id-box {
			display: flex;
			justify-content: space-between;
			color: #ccc;
			font-size: 24rpx;
		}

		.footer {
			padding-top: 30%;
			text-align: center;
		}
	}
</style>
