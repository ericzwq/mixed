export enum MsgType { // 消息类型
  system = 0, // 系统消息
  text = 1, // 文本
  pic = 2, // 图片
  audio = 3, // 音频
  video = 4, // 视频
  retract = 5, // 撤回
  dynamicSys = 6, // 动态的系统消息  '#创建了群聊/' + encodeURIComponent(from)
  chatLogs = 7, // 聊天记录
}

export enum MsgStatus {
  normal = 0,
  retract = 1,
  reply = 2
}

export enum MsgRead {
  no = 0,
  yes = 1
}

export enum ChatType {
  single = '1',
  group = '2'
}

export enum MsgState {
  loading = 1,
  error = 2,
  delete = 3
}

export enum SysMsgContType {
  text = 1, // 普通文本
  username = 2 // 用户名
}

export namespace GroupApls {
  export enum Type {
    active = 1, // 加群申请
    passive = 2 // 邀请申请
  }

  export enum Status {
    pending = 0,  // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

export namespace FriendApls {
  export enum Status {
    pending = 0, // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}