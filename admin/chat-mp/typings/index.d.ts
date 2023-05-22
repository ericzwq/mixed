/// <reference path="./types/index.d.ts" />
/// <reference path="../miniprogram/node_modules/miniprogram-api-typings/index.d.ts" />


interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: SgMsgs.FakeId[] }
    saveStatus: string
  }
  getUser: () => boolean
  saveMessages: () => void
  saveMessagesHanlder: () => void
  saveChat: (message: SgMsg, target: Contact, newCount: number) => void
  addRecMsgsListener: () => void
  // userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

interface VanInputEvent<T> {
  detail: T
}

interface PageOptions {
  data?: string
}