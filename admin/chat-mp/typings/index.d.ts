/// <reference path="./types/index.d.ts" />
/// <reference path="../miniprogram/node_modules/miniprogram-api-typings/index.d.ts" />

interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: Set<SgMsgs.FakeId> }
    toSaveGroupIdFakeIdsMap: { [k in string]: Set<GpMsgs.FakeId> }
    saveStatus: string
  }
  getUser: () => boolean
  saveMessages: () => void
  saveMessagesHandler: () => void
  saveChats: (message: SgMsg | GpMsg, target: { nickname: string, avatar: string }, newCount: number, chatType: ChatType) => void
  setToSaveFakeIds: (to: Users.Username | Groups.Id, fakeIds: SgMsgs.FakeId[], isSingle: boolean) => void
  addRecSgMsgsListener: () => void
  addRecGpMsgsListener: () => void
  recMsgSuccessHandler: <T extends SgMsg | GpMsg>(data: SocketResponse<T[]>, isSingle: boolean) => void
  getMessageInfo: (to: Users.Username | Groups.Id, chatType: ChatType) => MessageInfo<SgMsg | GpMsg>
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
  touches: {
    identifier: number
    pageX: number
    pageY: number
    clientX: number
    clientY: number
  }[]
}

interface PageOptions {
  data?: string
}