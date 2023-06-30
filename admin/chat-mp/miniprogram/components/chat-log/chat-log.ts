import {createStoreBindings} from "mobx-miniprogram-bindings"
import {ChatLogDetailPath} from "../../consts/routes"
import {chatSocket} from "../../socket/socket"
import {GET_GP_MSGS_BY_IDS, GET_SG_MSGS_BY_IDS} from "../../socket/socket-actions"
import {ChatType} from "../../socket/socket-types"
import {stagingStore, userStore} from "../../store/store"
import {replyMsgToNormalMsg} from "../../common/utils";

Component({
  properties: {
    data: {
      type: null
    }
  },
  data: {
    maxLine: 4,
    title: '',
    contents: [] as SgMsg[] | GpMsg[],
    storeBindings: {} as StoreBindings,
  },
  methods: {
    toChatLogDetail() {
      wx.navigateTo({url: ChatLogDetailPath + '?data=' + encodeURIComponent(JSON.stringify(this.properties.data))})
    }
  },
  lifetimes: {
    attached() {
      this.data.storeBindings = createStoreBindings(this, {
        store: userStore,
        fields: ['unameUserMap']
      })
      const {chatType, ids}: ChatLog = this.properties.data
      const {maxLine} = this.data
      const fakeId = Math.random() + '-' + Date.now()
      const action = chatType === ChatType.single ? GET_SG_MSGS_BY_IDS : GET_GP_MSGS_BY_IDS
      const handler = (data: SocketResponse<GetMsgsByIdsRes>) => {
        const {fakeId: _fakeId, data: res} = data.data
        if (_fakeId !== fakeId) return
        chatSocket.removeSuccessHandler(action, handler)
        const memberSet = new Set<Users.Username>()
        res.some((selected: SgMsg | GpMsg) => memberSet.add(selected.from!).size === 2)
        res.forEach(replyMsgToNormalMsg)
        const {chatLog} = stagingStore
        chatLog.computeChatLogTitle(Array.from(memberSet), chatType).then(title => {
          this.setData({title, contents: res})
        })
      }
      chatSocket.send({action, data: {fakeId, data: ids.slice(0, maxLine + 1)}}) // 多取一条判断是否还有更多
      chatSocket.addSuccessHandler(action, handler)
    },
    moved() {
      this.data.storeBindings.destroyStoreBindings()
    }
  }
})