/// <reference path="./types/index.d.ts" />
/// <reference path="../miniprogram/node_modules/miniprogram-api-typings/index.d.ts" />

interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: Set<SgMsgs.FakeId> }
    toSaveGroupIdFakeIdsMap: { [k in string]: Set<GpMsgs.FakeId> }
    saveStatus: string
    visible: boolean
  }
  isAtChatDetailPage: () => boolean
  getUser: () => boolean
  saveMessages: () => void
  saveMessagesHandler: () => void
  saveChats: (message: SgMsg | GpMsg, target: { nickname: string, avatar: string }, newCount: number, chatType: ChatType) => void
  setToSaveFakeIds: (to: Users.Username | Groups.Id, fakeIds: SgMsgs.FakeId[], isSingle: boolean) => void
  addRecSgMsgsListener: () => void
  addRecGpMsgsListener: () => void
  recMsgSuccessHandler: <T extends SgMsgRes | GpMsgRes>(data: SocketResponse<T[]>, isSingle: boolean) => void
  getMessageInfo: (to: Users.Username | Groups.Id, chatType: ChatType) => MessageInfo<SgMsg | GpMsg>
  addReadMsgsListener: () => void
  readMsgsHandler: (data: SocketResponse, isSingle: boolean) => void
  getRealFromTo: (from: GpMsgs.From | GpMsgs.To, to: GpMsgs.From | GpMsgs.To) => { from: GpMsgs.From, to: GpMsgs.From | GpMsgs.To }
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