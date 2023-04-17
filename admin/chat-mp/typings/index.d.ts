/// <reference path="./types/index.d.ts" />


interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: Messages.FakeId[] }
    saveStatus: string
  }
  getUser: () => void
  addMessageListener: () => void
  saveMessages: () => void
  saveMessagesHanlder: () => void
  // userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}