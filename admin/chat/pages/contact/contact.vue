<template>
	<view class="contact-box">
		<view class="contact-item">
			<image class="left" src="../../static/image/add.svg"></image>
			<view class="right">新的朋友</view>
		</view>
		<view class="contact-item">
			<image class="left" src="../../static/image/group-chat.svg"></image>
			<view class="right">群聊</view>
		</view>
		<view class="contact-item" v-for="i in contacts" :key="i.id" @click="toDetail(i)">
			<image class="left" :src="STATIC_BASE_URL + i.avatar"></image>
			<view class="right">{{ i.nickname }}</view>
		</view>
		<Fab />
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import {
		STATIC_BASE_URL
	} from '../../consts/consts.js'
	import Fab from '../../components/Fab.vue'
	export default {
		components: {
			Fab
		},
		data() {
			return {
				STATIC_BASE_URL
			}
		},
		computed: {
			...mapState(['contacts'])
		},
		mounted() {},
		methods: {
			toDetail({
				username,
			}) {
				uni.navigateTo({
					url: '/pages/user/user-detail?username=' + username
				})
			}
		}
	}
</script>

<style lang="scss">
	.contact-box {
		.contact-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 120rpx;
		}

		.left {
			display: block;
			width: 80rpx;
			height: 80rpx;
			margin: 20rpx;
			border-radius: 8rpx;
		}

		.right {
			display: flex;
			flex-grow: 1;
			align-items: center;
			height: 100%;
			border-bottom: 1px solid #efefef;
		}
	}
</style>
