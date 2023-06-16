import {ChooseFriendPath} from "../../consts/routes"
import {BASE_URL} from "../../consts/consts"
import {userStore} from "../../store/user";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {ChooseMode} from "../choose-friend/choose-friend-types";

Page({
  data: {
    BASE_URL,
  },
  toChooseFriend() {
    wx.navigateTo({url: ChooseFriendPath + '?mode=' + ChooseMode.friends})
  },
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['groups']
    })
    userStore.getGroups()
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },
})