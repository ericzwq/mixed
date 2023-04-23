/// <reference path="./types/index.d.ts" />


interface IAppOption {
  globalData: {
    toSaveUnameFakeIdsMap: { [k in string]: Messages.FakeId[] }
    saveStatus: string
  }
  getUser: () => boolean
  saveMessages: () => void
  saveMessagesHanlder: () => void
  saveChat: (message: Message, target: Contact, newCount: number) => void
  addReceMsgsListener: () => void
  // userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}