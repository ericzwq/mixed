<template>
	<view class="message-box">
		<view v-for="i in 24" class="message-item" :key="i" @longpress="handleLongPress">
			<image class="left" src="../../static/logo.png"></image>
			<view class="right">
				<view class="content-box">
					<view class="remark">XXX</view>
					<view class="content">你好啊</view>
				</view>
				<view class="time">上午10:06</view>
			</view>
		</view>
		<view class="hover-btn-box" v-show="showHoverBtn" @click="clickMask">
			<view>删除该聊天</view>
		</view>
		<Fab />
	</view>
</template>

<script>
	import Fab from '../../components/Fab.vue'
	export default {
		components: {
			Fab
		},
		data() {
			return {
				showHoverBtn: false
			}
		},
		onLoad() {

		},
		methods: {
			handleLongPress() {
				this.showHoverBtn = true
			},
			clickMask() {
				this.showHoverBtn = false
			}
		}
	}
</script>

<style lang="scss">
	.message-box {
		.message-item {
			display: flex;
			justify-content: space-around;
			align-items: center;
			height: 120rpx;

			.left {
				display: block;
				width: 80rpx;
				height: 80rpx;
				margin: 20rpx;
				border-radius: 8rpx;
			}

			.right {
				display: flex;
				justify-content: space-between;
				flex-grow: 1;
				height: 100%;
				font-size: 24rpx;
				padding: 20rpx;
				padding-left: 0;
				box-sizing: border-box;
			}

			.content-box {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				height: 100%;
			}

			.remark {
				font-size: 28rpx;
			}

			.content {
				font-size: 24rpx;
				color: #aaa;
			}

			.time {
				font-size: 24rpx;
			}
		}

		.hover-btn-box {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;

			view {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				padding: 10px;
				border-radius: 3px;
				box-shadow: 0 0 3px #ccc;
			}
		}
	}
</style>
