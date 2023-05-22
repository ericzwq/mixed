interface SocketResponse<T = any> {
  status: number
  message: string
  data: T
  action: string
}

declare enum MsgType { // 消息类型
  system = 0, // 系统消息
  text = 1, // 文本
  pic = 2, // 图片
  audio = 3, // 音频
  video = 4, // 视频
  retract = 5, // 撤回
  dynamicSys = 6, // 动态的系统消息  '#创建了群聊/' + encodeURIComponent(from)
}

declare enum MsgStatus {
  normal = 0,
  retract = 1
}

declare enum MsgRead {
  no = 0,
  yes = 1
}