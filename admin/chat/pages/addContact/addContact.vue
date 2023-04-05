<template>
	<view class="add-contact-box">
		<input class="search-input" v-model="username" focus placeholder="请输入天聊号" />
		<button class="search-btn" type="primary" @click="search">搜索</button>
		<view v-show="noUser" class="no-user">该用户不存在</view>
	</view>
</template>

<script>
	import http from '../../http/http.js'
	import {
		searchUserUrl
	} from '../../http/urls.js'
	export default {
		data() {
			return {
				username: '',
				noUser: false
			}
		},
		mounted() {

		},
		methods: {
			search() {
				http.get(searchUserUrl, {
					username: this.username
				}).then(r => {
					const {
						data
					} = r.data
					this.noUser = data.length === 0
					if (!this.noUser) {
						const {
							avatar,
							username,
							nickname,
						} = data[0]
						uni.navigateTo({
							url: '/pages/user/user-detail?avatar=' + avatar + '&username=' + username + '&nickname=' + nickname
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.add-contact-box {
		padding: 120rpx 20rpx 0;
	}

	.search-input {
		border: 1px solid #ddd;
		border-radius: 10rpx;
		padding: 20rpx;
	}

	.search-btn {
		margin-top: 40rpx;
	}

	.no-user {
		padding: 20rpx;
		text-align: center;
		color: #ccc;
	}
</style>
