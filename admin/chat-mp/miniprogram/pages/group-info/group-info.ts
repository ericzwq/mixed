import {chatSocket} from "../../socket/socket";
import {GET_GROUP_MEMBERS} from "../../socket/socket-actions";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userStore} from "../../store/user";
import {BASE_URL} from '../../consts/consts'

Page({
  data: {
    BASE_URL,
    count: 0,
    name: '',
    exitClass: '',
    members: [] as Users.Username[]
  },
  storeBindings: {} as StoreBindings,
  onLoad: function (options: { id: string }) {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['unameUserMap']
    })
    const id = +options.id
    chatSocket.send({action: GET_GROUP_MEMBERS, data: {id}})
    const handler = (data: SocketResponse<Groups.Member>) => {
      chatSocket.removeSuccessHandler(GET_GROUP_MEMBERS, handler)
      userStore.getGroupIdGroupInfo(id).then(({leader, manager, count, name}) => {
        const managers = manager ? manager.split(',') : []
        const members = [leader, ...managers, ...(data.data ? data.data.split(',') : [])]
        this.setData({members, count, name})
        wx.setNavigationBarTitle({title: '群聊信息（' + count + '）'})
      })
    }
    chatSocket.addSuccessHandler(GET_GROUP_MEMBERS, handler)
  },
  exit() {
    wx.showModal({title: '确定退出群聊吗？'}).then(() => {

    })
  },
  onTouchStart() {
    this.setData({exitClass: 'active'})
  },
  onTouchCancel() {
    this.setData({exitClass: ''})
  },
  onUnload(): void | Promise<void> {
    this.storeBindings.destroyStoreBindings()
  }
});