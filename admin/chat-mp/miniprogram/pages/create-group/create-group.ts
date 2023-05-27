import {BASE_URL} from "../../consts/consts"
import {upPicUrl} from "../../http/urls"
import {chatSocket} from "../../socket/socket";
import {CREAT_GROUP} from "../../socket/socket-actions";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [] as File[],
    task: {} as WechatMiniprogram.UploadTask,
    _selecteds: [] as Users.Username[],
    formData: {
      name: ''
    },
    errors: {
      name: ''
    },
    _validators: {
      name(v: string) {
        this.setData({'errors.name': v ? '' : '请输入群聊名称'})
        return this.data.errors.name
      }
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
    const {fileList} = this.data;
    fileList.push({...file, status: 'uploading', message: '0%'});
    this.setData({fileList})
    const task = wx.uploadFile({
      url: BASE_URL + '/' + upPicUrl,
      filePath: file.url,
      name: 'file',
      header: {cookie: wx.getStorageSync('cookies')},
      success: (res) => {
        if (res.statusCode > 199 && res.statusCode < 300) {
          const data: SocketResponse<{ data: string }> = JSON.parse(res.data)
          if (data.status === 0) {
            Object.assign(fileList[0], {url: BASE_URL + data.data, shortUrl: data.data, status: 'done'})
          } else {
            Object.assign(fileList[0], {status: 'failed', message: '上传失败'})
          }
        } else {
          Object.assign(fileList[0], {status: 'failed', message: '上传失败'})
        }
        this.setData({fileList});
      },
      fail: (e) => {
        console.log('上传失败：', e)
        fileList[0].status = 'failed'
        this.setData({fileList})
      }
    })
    this.setData({task})
    task.onProgressUpdate(data => {
      fileList[0].message = data.progress + '%'
      this.setData({fileList})
    })
  },
  onDelete() {
    this.setData({fileList: []})
  },
  nameChange(e: VanInputEvent<string>) {
    this.setData({'formData.name': e.detail})
    this.data._validators.name.call(this, e.detail)
  },
  createGroupHandler: () => {
  },
  createGroup() {
    const {_selecteds, formData, fileList, _validators} = this.data
    if (Object.keys(formData).some(k => _validators[k as keyof typeof formData].call(this, formData[k as keyof typeof formData]))) return
    new Promise<void>(resolve => {
      if (fileList[0] && fileList[0].status === 'uploading') wx.showModal({title: '图片未上传完成，确定继续吗？'}).then(() => resolve())
      else resolve()
    }).then(() => {
      chatSocket.send<CreateGroupReq>({
        action: CREAT_GROUP,
        data: {members: _selecteds, avatar: fileList.length ? fileList[0].shortUrl : '', name: formData.name}
      }).then(() => {
        this.createGroupHandler = () => {
          chatSocket.removeSuccessHandler(CREAT_GROUP, this.createGroupHandler)
          wx.hideLoading()
          wx.showToast({title: '创建成功'})
          setTimeout(() => wx.navigateBack({delta: 2}), 1000)
        }
        chatSocket.addSuccessHandler(CREAT_GROUP, this.createGroupHandler)
      })
      wx.showLoading({title: '加载中...'})
    })
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
    chatSocket.removeSuccessHandler(CREAT_GROUP, this.createGroupHandler)
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