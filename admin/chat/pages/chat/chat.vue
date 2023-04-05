<template>
	<view :class="['chat-box', keyboardUp ? 'focus': '']">
		<view :class="['main', showOpts ? 'showOpt' : '']" ref="main">
			<template v-for="(v,i) in viewMessages">
				<view v-if="v.type === 0" class="middle" :key="v.fackId">{{v.data}}</view>
				<view v-else-if="user.username !== v.from" class="item left" :key="v.fackId">
					<image :src="STATIC_BASE_URL + target.avatar"></image>
					<view class="content">
						<view v-if="v.type === 1">{{v.data}}</view>
						<uni-icons v-else-if="v.type === 3" type="sound" :ref="'audio' + i" class="audio"
							@click="audioPlay(v, i)"></uni-icons>
					</view>
					<uni-icons v-if="v.state === 'loading'" type="loop" size="18" class="status loading"></uni-icons>
					<uni-icons v-if="v.state === 'error'" type="info-filled" size="20" color="red" class="status error">
					</uni-icons>
				</view>
				<view v-else class="item right" :key="v.fackId">
					<uni-icons v-if="v.state === 'loading'" type="loop" size="18" class="status loading"></uni-icons>
					<uni-icons v-if="v.state === 'error'" type="info-filled" size="20" color="red" class="status error">
					</uni-icons>
					<view class="content">
						<view v-if="v.type === 1">{{v.data}}</view>
						<uni-icons v-else-if="v.type === 3" type="sound" :ref="'audio' + i" class="audio"
							@click="audioPlay(v, i)"></uni-icons>
					</view>
					<image :src="STATIC_BASE_URL + user.avatar"></image>
				</view>
			</template>
		</view>
		<view :class="['bottom', showOpts ? 'showOpt' : '']">
			<view class="input-box">
				<uni-icons v-show="inputState === 0" type="mic-filled" size="30" @click="inputState = 1"></uni-icons>
				<uni-icons v-show="inputState === 1" type="undo-filled" size="30" @click="retKeybroad"></uni-icons>
				<input v-show="inputState === 0" v-model.trim="content" />
				<button v-show="inputState === 1" class="btn-small" size="mini"
					@click="handleRecording">{{[0, 2].includes(recordState) ? '开始录制' : '停止录制'}}</button>
				<uni-icons v-show="!content && !recorder" type="plus-filled" size="30" @click="handleShowOpts">
				</uni-icons>
				<button v-show="content || recorder" size="mini" type="primary" @click="send">发送</button>
				<button v-show="inputState === 1 && recordState === 2" size="mini" type="default" class="cancel"
					@click="cancel">取消</button>
			</view>
			<view v-show="showOpts" class="opts">
				<view class="opt-item">
					<uni-icons type="image" size="40"></uni-icons>
					<text>图片</text>
				</view>
				<view class="opt-item">
					<uni-icons type="folder-add" size="40"></uni-icons>
					<text>文件</text>
				</view>
				<view class="opt-item" @click="handleVoiceCall">
					<uni-icons type="mic" size="40"></uni-icons>
					<text>语音</text>
				</view>
				<view class="opt-item">
					<uni-icons type="videocam" size="40"></uni-icons>
					<text>视频</text>
				</view>
			</view>
		</view>
		<uni-popup ref="confirmCall" type="dialog">
			<uni-popup-dialog ref="inputClose" title="语音通话" @confirm="dialogInputConfirm" @close="dialogInputClose"
				confirmText="接听" cancelText="拒接"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="calling" type="dialog" backgroundColor="#fff">
			<view class="calling-box">
				<video ref="localVideo" autoplay muted></video>
				<video ref="remoteVideo" autoplay :muted="isMuted"></video>
				<view class="state">正在等待对方回应...</view>
				<view class="btns">
					<button type="primary" size="mini" @click="handleMute">{{isMuted ? '开音' : '静音'}}</button>
					<button type="primary" size="mini" @click="cancelCall">取消</button>
					<button type="primary" size="mini" @click="handleMicoff">{{noMicoff ? '开麦' : '闭麦'}}</button>
					<button type="primary" size="mini" @click="handleVideo">{{noVideo ? '开像' : '关像'}}</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import {
		chatSocket,
		voiceSocket
	} from '../../socket/socket.js'
	import {
		STATIC_BASE_URL
	} from '../../consts/consts.js'
	import {
		formatDate
	} from '../../common/utils.js'
	import {
		ANSWER,
		CANDIDATE,
		OFFER,
		SEND_MSG,
		VOICE_RESULT
	} from '../../socket/socket-actions'
	export default {
		data() {
			return {
				target: {}, // 目标用户
				content: '',
				keyboardUp: false,
				windowHeight: 0,
				type: '1', // 1单聊 2群聊
				STATIC_BASE_URL,
				messagesMap: {},
				messages: [],
				viewMessages: [],
				loadMessageCount: 16, // 默认加载消息数
				maxMessagesIndex: 0, // messages最大本地缓存分页索引
				loadedMessagesIndex: -1, // messages已加载本地缓存分页索引
				loadedMessagesPageMinIndex: Infinity, // 本地缓存中已加载的分页最小索引
				saveIds: [], // 需要缓存的id列表
				saveTime: 0,
				saveStatus: '',
				inputState: 0, // 0键盘 1语音
				recordState: 0, // 0未开始(无数据) 1录制中 2录制完
				recorder: null,
				recordData: null,
				innerAudioContext: null,
				audioPlayIndex: -1, // 音频播放的索引
				showOpts: false,
				voiceTarget: null,
				offer: null,
				rtc1: null,
				rtc2: null,
				isMuted: false,
				noMicoff: false,
				noVideo: false,
				localStream: null,
				remoteStream: null,
				callState: 0, // 1主动方 2接收方
				audioSender: [],
				videoSender: [],
			}
		},
		computed: {
			...mapState(['contactMap', 'user'])
		},
		onLoad({
			username,
			type
		}) {
			const target = this.contactMap.get(username)
			if (!target) return
			this.target = target
			this.type = type
			uni.setNavigationBarTitle({
				title: target?.nickname
			})
			this.loadInitMessage()
		},
		onReady() {
			this.windowHeight = uni.getWindowInfo().windowHeight
			uni.onWindowResize(e => {
				this.keyboardUp = this.windowHeight > e.size.windowHeight
				this.windowHeight = e.size.windowHeight
				setTimeout(() => this.scrollView(0))
			})
			this.addMessageListener()
			window.addEventListener('touchstart', e => {
				if (e.target.tagName === 'INPUT') {
					this.showOpts = false
					setTimeout(() => e.target.focus(), 500)
				}
			})
		},
		onPullDownRefresh() {
			this.loadMoreMessage()
		},
		methods: {
			// 静音
			handleMute() {
				this.isMuted = !this.isMuted
				if (this.isMuted) {
					this.$refs['remoteVideo'].$el.querySelector('video').setAttribute('muted', true)
				} else {
					this.$refs['remoteVideo'].$el.querySelector('video').remoteAttribute('muted')
				}
			},
			// 取消呼叫
			cancelCall() {
				this.callState = 0
			},
			// 麦克风
			handleMicoff() {
				this.noMicoff = !this.noMicoff
				if (this.noMicoff) {
					if (this.callState === 1) {
						this.audioSender.forEach(sender => this.rtc1.removeTrack(sender))
					} else if (this.callState === 2) {
						this.audioSender.forEach(sender => this.rtc2.removeTrack(sender))
					}
					this.audioSender = []
				} else {
					this.localStream.getTracks().forEach(track => {
						if (track.kind === 'audio') {
							let sender
							if (this.callState === 1) {
								sender = this.rtc1.addTrack(track, this.localStream)
							} else if (this.callState === 2) {
								sender = this.rtc1.addTrack(track, this.localStream)
							}
							this.audioSender.push(sender)
						}
					})
				}

			},
			// 摄像头
			handleVideo() {
				this.noVideo = !this.noVideo
				if (this.noVideo) {
					if (this.callState === 1) {
						this.videoSender.forEach(sender => this.rtc1.removeTrack(sender))
					} else if (this.callState === 2) {
						this.videoSender.forEach(sender => this.rtc2.removeTrack(sender))
					}
					this.videoSender = []
				} else {
					this.localStream.getTracks().forEach(track => {
						if (track.kind === 'video') {
							let sender
							if (this.callState === 1) {
								sender = this.rtc1.addTrack(track, this.localStream)
							} else if (this.callState === 2) {
								sender = this.rtc1.addTrack(track, this.localStream)
							}
							this.videoSender.push(sender)
						}
					})
				}
			},
			// 接收端确认
			dialogInputConfirm() {
				this.callState = 2
				this.$refs['calling'].open()
				this.$nextTick(() => {
					navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					}).then(stream => {
						this.$refs['localVideo'].$el.querySelector('video').srcObject = stream
						console.log(stream.getTracks())
						this.localStream = stream
						const rtc = new RTCPeerConnection()
						this.rtc2 = rtc
						rtc.addEventListener('track', e => {
							if (e.streams.length) {
								this.remoteStream = e.streams[0]
								this.$refs['remoteVideo'].$el.querySelector('video').srcObject = e
									.streams[0]
							}
						})
						rtc.addEventListener('icecandidate', e => {
							const {
								candidate
							} = e
							if (candidate) {
								rtc.addIceCandidate(candidate)
								chatSocket.send({
									action: CANDIDATE,
									data: {
										candidate,
										from: this.user.username,
										to: this.target.username
									}
								})
							}
						})
						rtc.setRemoteDescription(this.offer)
						stream.getTracks().forEach(track => {
							const sender = rtc.addTrack(track, stream)
							if (track.kind === 'audio') {
								this.audioSender.push(sender)
							} else if (track.kind === 'video') {
								this.videoSender.push(sender)
							}
						})
						rtc.createAnswer().then(answer => {
							rtc.setLocalDescription(answer)
							chatSocket.send({
								action: ANSWER,
								data: {
									answer,
									from: this.user.username,
									to: this.target.username
								}
							})
						})
					}, e => {
						uni.showToast({
							title: e.message
						})
						console.log('音频录制异常', e)
					})
				})
			},
			dialogInputClose() {
				chatSocket.send({
					action: VOICE_RESULT,
					data: {
						from: this.user.username,
						agree: false,
						to: this.voiceTarget.from
					}
				})
			},
			handleShowOpts() {
				this.showOpts = !this.showOpts
			},
			// 语音通话
			handleVoiceCall() {
				this.callState = 1
				this.$refs['calling'].open()
				this.$nextTick(() => {
					navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					}).then(stream => {
						this.localStream = stream
						this.$refs['localVideo'].$el.querySelector('video').srcObject = stream
						const rtc = new RTCPeerConnection()
						this.rtc1 = rtc
						rtc.addEventListener('track', e => {
							if (e.streams.length) {
								this.remoteStream = e.streams[0]
								this.$refs['remoteVideo'].$el.querySelector('video').srcObject = e
									.streams[0]
							}
						})
						rtc.addEventListener('icecandidate', e => {
							const {
								candidate
							} = e
							if (candidate) {
								rtc.addIceCandidate(candidate)
								chatSocket.send({
									action: CANDIDATE,
									data: {
										candidate,
										from: this.user.username,
										to: this.target.username
									}
								})
							}
						})
						stream.getTracks().forEach(track => {
							const sender = rtc.addTrack(track, stream)
							if (track.kind === 'audio') {
								this.audioSender.push(sender)
							} else if (track.kind === 'video') {
								this.videoSender.push(sender)
							}
						})
						rtc.createOffer().then(offer => {
							rtc.setLocalDescription(offer)
							chatSocket.send({
								action: OFFER,
								data: {
									offer,
									from: this.user.username,
									to: this.target.username
								}
							})
						})
					}, e => {
						uni.showToast({
							title: e.message
						})
						console.log('音频录制异常', e)
					})
				})
			},
			// 首屏获取本地消息
			loadInitMessage() {
				const username = this.target.username
				this.maxMessagesIndex = uni.getStorageSync(username + '-i')
				if (this.maxMessagesIndex) { // 有本地消息
					this.loadedMessagesIndex = this.maxMessagesIndex = parseInt(this.maxMessagesIndex)
					const messages = JSON.parse(uni.getStorageSync(username + '-' + this.maxMessagesIndex))
					// console.log(messages.length, this.loadMessageCount, this.maxMessagesIndex)
					if (messages.length < this.loadMessageCount && this.maxMessagesIndex >
						0) { // 消息不够loadMessageCount从上一页加载
						const lastMessages = JSON.parse(uni.getStorageSync(this.target.username + '-' + (--this
							.loadedMessagesIndex)))
						this.loadedMessagesPageMinIndex = lastMessages.length - (this.loadMessageCount - messages
							.length)
						this.messages = lastMessages.slice(this.loadedMessagesPageMinIndex).concat(messages)
					} else { // 取本页数据
						if (this.maxMessagesIndex === 0) {
							this.loadedMessagesPageMinIndex = 0
						} else {
							this.loadedMessagesPageMinIndex = messages.length - this.loadMessageCount
						}
						this.messages = messages.slice(this.loadedMessagesPageMinIndex)
					}
				} else {
					this.loadedMessagesIndex = -1
					this.maxMessagesIndex = 0
				}
				this.viewMessages = this.handleViewMessageTime(this.messages)
				this.resetMessagesMap()
			},
			// 获取更多消息
			loadMoreMessage() {
				const {
					username
				} = this.target
				let preMessages
				if (this.loadedMessagesPageMinIndex >= this.loadMessageCount) { // 本页数据够
					const messages = JSON.parse(uni.getStorageSync(username + '-' + (this
						.loadedMessagesIndex)))
					this.loadedMessagesPageMinIndex -= this.loadMessageCount
					preMessages = messages.slice(this.loadedMessagesPageMinIndex, this.loadedMessagesPageMinIndex +
						this.loadMessageCount)
					this.messages = preMessages.concat(this.messages)
				} else if (this.loadedMessagesIndex === 0) { // 到顶 todo 最后一项
					if (this.loadedMessagesPageMinIndex > 0) {
						const messages = JSON.parse(uni.getStorageSync(username + '-' + (this
							.loadedMessagesIndex)))
						preMessages = messages.slice(0, this.loadedMessagesPageMinIndex)
						this.messages = preMessages.concat(this.messages)
						this.loadedMessagesPageMinIndex = 0
					}
				} else { // 本页数据不够
					const messages = JSON.parse(uni.getStorageSync(username + '-' + this.loadedMessagesIndex))
					const lastMessages = JSON.parse(uni.getStorageSync(username + '-' + (--this
						.loadedMessagesIndex)))
					const _loadedMessagesPageMinIndex = this.loadedMessagesPageMinIndex
					this.loadedMessagesPageMinIndex = lastMessages.length - (this.loadMessageCount - this
						.loadedMessagesPageMinIndex)
					preMessages = lastMessages.slice(this.loadedMessagesPageMinIndex).concat(messages.slice(0,
						_loadedMessagesPageMinIndex))
					this.messages = preMessages.concat(this.messages)
				}
				// console.log(this.loadedMessagesPageMinIndex, this.loadedMessagesIndex, this.messages.length)
				if (preMessages) {
					const preViewMessages = this.handleViewMessageTime(preMessages)
					const viewMessages = this.viewMessages
					if (viewMessages.length && !this.cmpTime(preViewMessages[preViewMessages.length - 1].createdAt,
							viewMessages[0].createdAt)) {
						viewMessages.shift() // 删除间隔时间
					}
					this.viewMessages = preViewMessages.concat(viewMessages)
				}
				this.resetMessagesMap()
				uni.stopPullDownRefresh()
			},
			resetMessagesMap() {
				this.messagesMap = {}
				this.messages.forEach((v, i) => this.messagesMap[v.fackId] = i)
			},
			// 注册socket消息监听
			addMessageListener() {
				chatSocket.messageHandlers[0] = (_data => {
					const handler = {
						receiveMessages,
						// connVoice,
						[VOICE_RESULT]: voiceResult,
						[OFFER]: offer,
						[ANSWER]: answer,
						[CANDIDATE]: candidate,
					}
					handler[_data.action].call(this, _data)

					function offer(data) {
						this.offer = data.data.offer
						this.$refs['confirmCall'].open()
					}

					function answer(data) {
						this.rtc1.setRemoteDescription(data.data.answer)
					}

					function candidate(data) {
						if (this.callState === 1) {
							this.rtc1.addIceCandidate(data.data.candidate)
						} else if (this.callState === 2) {
							this.rtc2.addIceCandidate(data.data.candidate)
						}
					}

					function voiceResult(_data) {
						if (!_data.data.agree) {
							voiceSocket.close('对方已拒接')
						}
					}

					function receiveMessages(_data) {
						console.log(_data.data)
						_data.data.forEach(data => {
							const message = this.messages[this.messagesMap[data.fackId]]
							if (message) { // 自己发的
								message.state = undefined
								message.status = data.status
								message.createdAt = data.createdAt
								if (message.type === 3) { // 音频数据处理
									message.data = data.data
								}
							} else { // 别人发的
								delete data.message
								delete data.state
								this.messagesMap[data.fackId] = this.messages.push(data) - 1
								const length = this.viewMessages.push(data)
								this.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(
									undefined,
									length - 2))
							}
							this.saveIds.push(this.messages[this.messages.length - 1].fackId)
						})
						this.scrollView()
						this.saveMessages()
					}

					function connVoice(_data) {
						this.voiceTarget = _data.data
						this.$refs['confirmCall'].open()
					}
				})
			},
			formatDate(date) {
				const h = date.getHours()
				return `${h >= 12 ? '下午' + (h - 12) : '上午' + h}:${date.getMinutes().toString().padStart(2, '0')}`
			},
			cmpTime(t1, t2) {
				return new Date(t1).getTime() < new Date(t2).getTime() - 180000 // 大于3分钟显示时间
			},
			handleViewMessageTime(target = this.viewMessages, start = 0, end = target.length) {
				if (start < 0) start = 0
				if (end <= start) return target.slice()
				const res = [target[start]]
				for (let i = start + 1; i < end; i++) {
					const createdAt = target[i].createdAt
					if (this.cmpTime(target[i - 1].createdAt, createdAt)) {
						res.push({
							data: this.formatDate(new Date(createdAt)),
							type: 0,
						})
					}
					res.push(target[i])
				}
				if (start === 0) {
					res.unshift({
						data: this.formatDate(new Date(target[0].createdAt)),
						type: 0
					})
				}
				return res
			},
			scrollView(duration = 100) {
				this.$nextTick(() => uni.pageScrollTo({
					scrollTop: Infinity,
					selector: 'window',
					duration
				}))
			},
			// 缓存消息
			saveMessages() {
				if (this.saveStatus !== 'pending') {
					setTimeout(this.saveMessagesHanlder.bind(this), 2000)
					this.saveStatus = 'pending'
				}
			},
			saveMessagesHanlder() {
				const data = []
				const length = 16
				const prefixKey = this.target.username + '-'
				const pages = new Set()
				let start = length - this.loadedMessagesPageMinIndex - 1
				if (start === -Infinity) start = -1 // 无缓存
				this.saveIds.forEach(id => {
					const index = (this.messagesMap[id] - start) / length
					console.log(this.messagesMap[id], start, index, this.loadedMessagesPageMinIndex)
					// const page = (index > 0 ? Math.ceil(index) : Math.floor(index)) + this.loadedMessagesIndex + 1
					// if (index < 0) console.error(index)
					const page = Math.ceil(index) + this.loadedMessagesIndex
					pages.add(page)
				})
				console.log(pages)
				for (const i of pages) {
					if (i > this.maxMessagesIndex) this.maxMessagesIndex = i
					const left = start + 1 + length * (i - this.loadedMessagesIndex - 1)
					// console.log(this.messages[this.messages.length - 1].data, left, start, i, this.messages.length)
					uni.setStorageSync(prefixKey + i, JSON.stringify(this.messages.slice(left, left + length)))
				}
				uni.setStorageSync(prefixKey + 'i', this.maxMessagesIndex + '')
				this.saveIds = []
				this.saveStatus = ''
			},
			audioPlay(data, i) {
				if (i === this.audioPlayIndex) { // 点击同一个
					if (this.innerAudioContext.paused) {
						this.innerAudioContext.play()
						this.$refs['audio' + this.audioPlayIndex][0].$el.classList.add('play')
					} else {
						this.innerAudioContext.pause()
						this.$refs['audio' + this.audioPlayIndex][0].$el.classList.remove('play')
					}
					return
				}
				if (this.innerAudioContext && !this.innerAudioContext.paused) {
					this.$refs['audio' + this.audioPlayIndex][0].$el.classList.remove('play')
					this.innerAudioContext.destroy()
				}
				const innerAudioContext = uni.createInnerAudioContext()
				innerAudioContext
				this.innerAudioContext = innerAudioContext
				innerAudioContext.src = STATIC_BASE_URL + data.data
				innerAudioContext.play()
				this.audioPlayIndex = i
				const el = this.$refs['audio' + i][0].$el
				el.classList.add('play')
				innerAudioContext.onEnded(() => {
					el.classList.remove('play')
				})
				innerAudioContext.onError((res) => {
					console.log(res.errMsg)
					console.log(res.errCode)
					el.classList.remove('play')
					uni.showToast({
						title: '音频播放异常：' + res.errMsg
					})
				})
			},
			// 取消录音
			cancel() {
				this.recordState = 0
				this.recorder = null
			},
			// 返回键盘输入
			retKeybroad() {
				this.inputState = 0
				this.cancel()
			},
			handleRecording() {
				if (this.recordState === 0) { // 未开始
					this.recordState = 1
				} else if (this.recordState === 1) { // 录制中
					this.recordState = 2 // 录制结束
				}

				// #ifdef H5
				if (this.recordState === 1) {
					navigator.mediaDevices.getUserMedia({
						video: false,
						audio: true
					}).then(stream => {
						this.recorder = new MediaRecorder(stream)
						this.recorder.start()
						this.recorder.ondataavailable = e => this.recordData = e.data
					}, e => {
						uni.showToast({
							title: e.message
						})
						console.log('音频录制异常', e)
						this.isRecording = false
					})
				} else if (this.recordState === 2) {
					this.recorder.stop()
				} else {
					this.recorder = null
				}
				// #endif

				// #ifdef !H5

				// #endif
			},
			async send() {
				console.log(this.recordState, this.inputState)
				const type = this.recordState === 2 && this.inputState === 1 ? 3 : 1 // 语音或文字
				const fackId = this.user.username + '-' + this.target.username + '-' + Date.now().toString(36)
				let data
				if (type === 3) {
					console.log(this.recordData)
					const arrayBuffer = await this.recordData.arrayBuffer()
					data = Array.prototype.slice.call(new Uint8Array(arrayBuffer))
					this.recordData = null
					this.recordState = 0
				} else {
					data = this.content
				}
				const message = {
					from: this.user.username,
					data: type === 3 ? '' : data, // 音频不保存在本地
					type,
					fackId,
					state: 'loading',
					createdAt: formatDate(),
					status: 0
				}
				chatSocket.send({
					target: this.type + '-' + this.target.username,
					content: data,
					fackId,
					type,
					action: SEND_MSG
				}).then(() => {
					this.messagesMap[fackId] = this.messages.push(message) - 1
					const length = this.viewMessages.push(message)
					this.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined,
						length -
						2))
					this.scrollView()
				}, () => {
					message.state = 'error'
					this.messagesMap[fackId] = this.messages.push(message) - 1
					const length = this.viewMessages.push(message)
					this.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined,
						length -
						2))
					this.scrollView()
				})
				this.content = ''
				this.saveIds.push(fackId)
				this.saveMessages()
			}
		},
	}
</script>
<style lang="scss">
	.chat-box {
		background-color: #eee;
		min-height: calc(100vh - 44px - env(safe-area-inset-top)); // 减去uni title 高度
		padding-bottom: 100rpx;
		box-sizing: border-box;

		.main {
			overflow: scroll;

			&.showOpt {
				// padding-bottom: 360rpx;
				// height: calc(100vh - 560rpx);
			}
		}

		image {
			display: block;
			height: 80rpx;
			width: 80rpx;
			margin: 0 20rpx;
		}

		.content {
			position: relative;
			padding: 10rpx 20rpx;
			max-width: 490rpx;
			line-height: 1.5;
			// line-height: 80rpx;
			box-sizing: border-box;
			background-color: #fff;
			border-radius: 8rpx;
			word-break: break-word;

			&::before {
				content: '';
				position: absolute;
				border: 16rpx transparent solid;
				top: 50%;
				transform: translateY(-50%);
			}
		}

		.audio {
			display: block;

			&.play {
				animation: zoom 1.5s linear infinite;
			}
		}

		.status {

			&.loading {
				animation: rotation 1s linear infinite;

				@keyframes rotation {
					from {
						transform: rotate(0);
					}

					to {
						transform: rotate(360deg);
					}
				}
			}
		}

		.middle {
			text-align: center;
			color: #ccc;
			font-size: 24rpx;
			margin-top: 20rpx;
		}

		.item {
			display: flex;
			align-items: center;
			margin-top: 20rpx;
			font-size: 28rpx;
		}

		@keyframes zoom {
			0 {
				transform: scale(1);
			}

			50% {
				transform: scale(1.3);
			}

			100% {
				transform: scale(1);
			}
		}

		.left {
			.status {
				margin-left: 10rpx;
			}

			.content {
				margin-left: 16rpx;

				&::before {
					left: -30rpx;
					border-right: 16rpx #fff solid;
				}
			}
		}

		.right {
			justify-content: flex-end;

			.status {
				margin-right: 10rpx;
			}

			.content {
				margin-right: 16rpx;
				background-color: $uni-color-primary;

				&::before {
					right: -30rpx;
					border-left: 16rpx $uni-color-primary solid;
				}
			}

			.audio {
				rotate: 180deg;
			}
		}

		.bottom {
			position: fixed;
			bottom: 0;
			// position: fixed;
			// bottom: 0;
			// height: 0;
			// bottom: 10px;
			width: 100%;
			background-color: #eee;
			// transition: height .5s;

			// &.focus {
			// 	padding-bottom: 50rpx;
			// }

			&.showOpt {
				// height: 360rpx;
			}

			.input-box {
				display: flex;
				align-items: center;
				height: 72rpx;
				padding-bottom: 20rpx;
			}

			.opts {
				display: flex;
				flex-wrap: wrap;

				.opt-item {
					display: flex;
					flex-direction: column;
					justify-content: center;
					width: 33.33%;
					text-align: center;
					font-size: 24rpx;
					margin-bottom: 20rpx;
				}
			}

			input {
				flex-grow: 1;
				background-color: #fff;
				padding: 10rpx;
				margin: 0 10rpx;
				border-radius: 8rpx;
			}

			button {
				background-color: $uni-color-primary;
			}

			.btn-small {
				background-color: #fff;
				flex-grow: 1;
				height: 70rpx;
				line-height: 70rpx;
				margin-right: 10rpx;
			}

			.cancel {
				background-color: red;
				color: #fff;
				margin-left: 10rpx;
			}
		}

		.calling-box {
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 20rpx;

			video {
				margin-bottom: 20rpx;
			}

			.state {
				text-align: center;
				margin-bottom: 20rpx;
			}

			.btns {
				display: flex;
				justify-content: space-around;
			}
		}
	}
</style>
