<template>
	<view class="user-detail-box">
		<view class="header">
			<image :src="STATIC_BASE_URL + target.avatar"></image>
			<view class="right">
				<text class="nickname">{{target.nickname}}</text>
				<text class="id">{{target.username}}</text>
			</view>
		</view>
		<view class="gap"></view>
		<button v-if="!isInContact" class="btn1" type="primary" @click="addContact">添加到通讯录</button>
		<button v-if="isInContact" @click="toChat">发消息</button>
		<button v-if="isInContact" class="btn3">音视频通话</button>
	</view>
</template>

<script>
	import {
		mapState, mapMutations
	} from 'vuex'
	import {
		STATIC_BASE_URL
	} from '../../consts/consts.js'
	import http from '../../http/http.js'
	import {
		addUserUrl
	} from '../../http/urls.js'
	export default {
		data() {
			return {
				STATIC_BASE_URL,
				target: {},
				isInContact: false
			}
		},
		computed: {
			...mapState(['contactMap', 'contacts'])
		},
		onLoad({
			username, nickname, avatar
		} = {}) {
			this.target = this.contactMap.get(username) || {username, nickname, avatar} // 添加好友或查看好友
			this.isInContact = this.contactMap.has(username)
		},
		methods: {
			...mapMutations(['setContacts']),
			// 添加到通讯录
			addContact() {
				http.post(addUserUrl, {
					username: this.target.username
				}).then(r => {
					if(r.data.status === 0) {
						this.setContacts(this.contacts.concat(this.target))
					}
				})
			},
			// 发消息
			toChat() {
				uni.navigateTo({
					url: '/pages/chat/chat?username=' + this.target.username + '&type=1' // 单聊
				})
			}
		},
		watch: {
			contactMap: {
				handler(news, old) {
					this.isInContact = news.has(this.target.username)
				},
				immediate: true
			}
		}
	}
</script>

<style lang="scss">
	.user-detail-box {
		.header {
			display: flex;
			justify-content: space-between;
			height: 120rpx;
		}

		image {
			display: block;
			width: 80rpx;
			height: 80rpx;
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

		.id {
			color: #ccc;
			font-size: 24rpx;
		}

		.gap {
			height: 20rpx;
			background-color: #eee;
		}

		.btn1 {
			margin-bottom: 20rpx;
		}

		.btn3 {
			margin-top: 20rpx;
		}
	}
</style>
