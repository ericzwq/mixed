/// <reference path="./types/index.d.ts" />
/// <reference path="../miniprogram/node_modules/miniprogram-api-typings/index.d.ts" />


interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: SgMsgs.FakeId[] }
    toSaveGroupIdFakeIdsMap: { [k in string]: GpMsgs.FakeId[] }
    saveStatus: string
  }
  getUser: () => boolean
  saveMessages: () => void
  saveMessagesHandler: () => void
  saveChats: (message: SgMsg | GpMsg, target: { nickname: string, avatar: string }, newCount: number, chatType: ChatType) => void
  addRecSgMsgsListener: () => void
  addRecGpMsgsListener: () => void
  // userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

interface VanInputEvent<T> {
  detail: T
}

interface LongPressEvent extends WechatMiniprogram.BaseEvent {
  detail: {
    x: number
    y: number
  }
}

interface PageOptions {
  data?: string
}