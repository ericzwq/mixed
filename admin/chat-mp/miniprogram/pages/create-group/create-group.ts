import {BASE_URL} from "../../consts/consts"
import {upAvatarUrl} from "../../http/urls"
import {chatSocket} from "../../socket/socket";
import {CREAT_GROUP} from "../../socket/socket-actions";

enum UpState {
  none,
  upping,
  success,
  error
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [] as File[],
    upState: UpState.none,
    upProgress: 0,
    task: {} as WechatMiniprogram.UploadTask,
    _selecteds: [] as Users.Username[],
    formData: {
      name: ''
    },
    errors: {
      name: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: PageOptions) {
    let data: Users.Username[]
    try {
      data = JSON.parse(decodeURIComponent(options.data!))
    } catch (e) {
      console.log(e)
      wx.showToast({title: '页面参数错误', icon: 'error'})
      return
    }
    this.data._selecteds = data
  },
  afterRead(event: { detail: { file: File } }) {
    const {file} = event.detail;
    const task = wx.uploadFile({
      url: BASE_URL + '/' + upAvatarUrl, // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      header: {cookie: wx.getStorageSync('cookies')},
      success: (res) => {
        const {fileList} = this.data;
        fileList.push({...file, url: res.data});
        this.setData({fileList, upState: UpState.success});
      },
    });
    this.setData({task})
    task.onProgressUpdate(data => {
      console.log('progress', data)
      this.setData({upProgress: data.progress})
    })
  },
  stop() {
    if (this.data.upState !== UpState.upping) return
    this.data.task.abort()
    this.setData({upState: UpState.none, upProgress: 0})
  },
  remove() {
    this.setData({fileList: []})
  },
  nameChange(e: VanInputEvent<string>) {
    this.setData({'formData.name': e.detail})
    this.setData({'errors.name': e.detail ? '' : '请输入群聊名称'})
  },
  createGroup() {
    const {_selecteds, formData, errors, fileList} = this.data
    if (Object.keys(formData).some(k => errors[k as keyof typeof errors])) return
    chatSocket.send<CreateGroupReq>({action: CREAT_GROUP, data: {members: _selecteds, avatar: fileList.length ? fileList[0].url : '', name: formData.name}}).then(() => {
      wx.hideLoading()
    })
    wx.showLoading({title: '加载中...'})
  },
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