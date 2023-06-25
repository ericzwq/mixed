import { chatSocket } from "../../socket/socket"
import { GET_SG_MSGS_BY_IDS, GET_GP_MSGS_BY_IDS } from "../../socket/socket-actions"
import { ChatType } from "../../socket/socket-types"
import { stagingStore } from "../../store/store"

// pages/chat-log-detail/chat-log-detail.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    contents: [] as SgMsg[] | GpMsg[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query: { data: string }) {
    const { data } = query
    const { chatType, ids } = JSON.parse(decodeURIComponent(data)) as ChatLog
    const fakeId = Math.random() + '-' + Date.now()
    const action = chatType === ChatType.single ? GET_SG_MSGS_BY_IDS : GET_GP_MSGS_BY_IDS
    const handler = (data: SocketResponse<GetMsgsByIdsRes>) => {
      const { fakeId: _fakeId, data: res } = data.data
      if (_fakeId !== fakeId) return
      chatSocket.removeSuccessHandler(action, handler)
      const memberSet = new Set<Users.Username>()
      res.some((selected: SgMsg | GpMsg) => memberSet.add(selected.from!).size === 2)
      const { chatLog } = stagingStore
      chatLog.computeChatLogTitle(Array.from(memberSet)).then(title => {
        this.setData({ title, contents: res })
      })
    }
    chatSocket.send({ action, data: { fakeId, data: ids } }) // 多取一条判断是否还有更多
    chatSocket.addSuccessHandler(action, handler)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})