import { chatSocket } from "../../socket/socket"
import { GET_SG_MSGS_BY_IDS, GET_GP_MSGS_BY_IDS } from "../../socket/socket-actions"
import { ChatType } from "../../socket/socket-types"
import { stagingStore, userStore } from "../../store/store"
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { BASE_URL } from '../../consts/consts'

Page({
  data: {
    contents: [] as SgMsg[] | GpMsg[],
    BASE_URL
  },
  storeBindings: {} as StoreBindings,
  onLoad(query: { data: string }) {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['unameUserMap']
    })
    const { data } = query
    const { chatType, ids } = JSON.parse(decodeURIComponent(data)) as ChatLog
    const fakeId = Math.random() + '-' + Date.now()
    const action = chatType === ChatType.single ? GET_SG_MSGS_BY_IDS : GET_GP_MSGS_BY_IDS
    const handler = (data: SocketResponse<GetMsgsByIdsRes>) => {
      const { fakeId: _fakeId, data: res } = data.data
      if (_fakeId !== fakeId) return
      chatSocket.removeSuccessHandler(action, handler)
      userStore.getUsers(res.map((m: SgMsg | GpMsg) => m.from!))
      const memberSet = new Set<Users.Username>()
      res.some((selected: SgMsg | GpMsg) => memberSet.add(selected.from!).size === 2)
      const { chatLog } = stagingStore
      chatLog.computeChatLogTitle(Array.from(memberSet), chatType).then(title => wx.setNavigationBarTitle({ title }))
      this.setData({ contents: res })
    }
    chatSocket.send({ action, data: { fakeId, data: ids } }) // 多取一条判断是否还有更多
    chatSocket.addSuccessHandler(action, handler)
  },
  onUnload(): void | Promise<void> {
    this.storeBindings.destroyStoreBindings()
  }
})