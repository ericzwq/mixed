import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userStore} from "../../store/user";
import {BASE_URL, primaryColor} from '../../consts/consts'

Page({
  data: {
    BASE_URL,
    primaryColor,
    keyword: '',
    selecteds: []
  },
  storeBindings: {} as StoreBindings,
  onLoad: function () {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['chats', 'unameUserMap']
    })
  },
  toggle() {

  },
  unselect() {

  },
  search() {

  },
  touchSearch() {

  },
  onUnload(): void | Promise<void> {
    this.storeBindings.destroyStoreBindings()
  }
});