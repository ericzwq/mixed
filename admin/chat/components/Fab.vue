<template>
	<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
		:direction="direction" @trigger="trigger" @fabClick="fabClick" />
</template>

<script>
	export default {
		name: "Fab",
		data() {
			return {
				horizontal: 'right',
				vertical: 'bottom',
				direction: 'horizontal',
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF',
					iconColor: '#fff'
				},
				content: [{
						iconPath: '/static/image/message.svg',
						selectedIconPath: '/static/image/message-active.svg',
						text: '添加',
						active: false
					},
					{
						iconPath: '/static/image/message.svg',
						selectedIconPath: '/static/image/message-active.svg',
						text: '扫一扫',
						active: false
					}
				]
			};
		},
		methods: {
			trigger(e) {
				console.log(e)
				if (e.index === 0) {
					uni.navigateTo({
						url: '/pages/addContact/addContact'
					})
				}
				// this.content[e.index].active = !e.item.active
				// uni.showModal({
				// 	title: '提示',
				// 	content: `您${this.content[e.index].active ? '选中了' : '取消了'}${e.item.text}`,
				// 	success: function(res) {
				// 		if (res.confirm) {
				// 			console.log('用户点击确定')
				// 		} else if (res.cancel) {
				// 			console.log('用户点击取消')
				// 		}
				// 	}
				// })
			},
			fabClick() {
				uni.showToast({
					title: '点击了悬浮按钮',
					icon: 'none'
				})
			},
		}
	}
</script>

<style lang="scss">

</style>
