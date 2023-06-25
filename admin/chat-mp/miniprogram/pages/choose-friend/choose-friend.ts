import { createStoreBindings } from "mobx-miniprogram-bindings";
import { userStore } from "../../store/user";
import { BASE_URL, primaryColor, SAVE_MESSAGE_LENGTH } from '../../consts/consts'
import { ChatsPath, CreateGroupPath } from "../../consts/routes";
import { ChooseMode, ListState, PageState } from './choose-friend-types'
// @ts-ignore
import py from 'wl-pinyin'
import { ChatType, MsgState, MsgType } from "../../socket/socket-types";
import { stagingStore } from "../../store/staging";
import { TransmitType } from "../chat-detail/chat-detail-types";
import { chatSocket } from "../../socket/socket";
import { SEND_GP_MSG, SEND_SG_MSG, TRANSMIT_GP_MSGS, TRANSMIT_SG_MSGS } from "../../socket/socket-actions";
import { formatDate } from "../../common/utils";

const app = getApp<IAppOption>()
Page({
  data: {
    selecteds: [] as Selected[],
    BASE_URL,
    primaryColor,
    indexListData: [] as { letter: string, contacts: Contact[] }[],
    keyword: '',
    indexList: [] as string[],
    searchedContacts: [] as Contact[],
    searchedGroups: [] as GetGroupsRes[],
    curChats: [] as ChatItem[],
    listState: ListState.normal as ListState,
    mode: ChooseMode.friends,
    pageState: PageState.recentChats,
    toChatTypeSelectedMap: {} as { [key in string]: boolean },
    showMore: false,
    defaultCount: 5,
    showDialog: false,
    isAudioPlay: false,
    iac: null as WechatMiniprogram.InnerAudioContext | null,
    singleSel: true,
    moreMsg: '',
  },
  onLoad({ mode }: { mode: ChooseMode }) {
    if (!mode) {
      wx.showToast({ title: '参数错误', icon: 'error' })
      return
    }
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['contacts', 'unameUserMap']
    })
    // @ts-ignore
    console.log(this.data, this.data.transmitData)
    userStore.getGroups()
    const contacts = [...userStore.contacts]
    const { username } = userStore.user
    contacts.splice(contacts.findIndex(c => c.username === username), 1)
    this.setIndexListData(contacts)
    const modeTitleMap = {
      [ChooseMode.chats]: '选择聊天',
      [ChooseMode.friends]: '选择联系人',
    }
    wx.setNavigationBarTitle({ title: modeTitleMap[mode] })
    const { chatLog } = stagingStore
    let pageState: PageState, singleSel: boolean = true
    if (mode === ChooseMode.friends) {
      pageState = PageState.selectContacts
      singleSel = false
    } else {
      pageState = PageState.recentChats
    }
    this.setData({ mode, pageState, singleSel, curChats: userStore.chats, chatLog })
  },
  setIndexListData(contacts: Contact[]) {
    const remarkLetterContactsMap = {} as { [key in string]: Contact[] }
    contacts.forEach(c => {
      let letter = py.getFirstLetter(c.remark.slice(0, 1))
      if (!/[A-Z]/.test(letter)) letter = '#'
      const cons = remarkLetterContactsMap[letter] || []
      cons.push(c)
      remarkLetterContactsMap[letter] = cons
    })
    const indexListData: { letter: string; contacts: Contact[] }[] = []
    Object.keys(remarkLetterContactsMap).forEach(letter => indexListData.push({ letter, contacts: remarkLetterContactsMap[letter] }))
    indexListData.sort((a, b) => a.letter.charCodeAt(0) - b.letter.charCodeAt(0))
    this.setData({ indexList: indexListData.map(i => i.letter), indexListData })
  },
  toggle(event: WechatMiniprogram.CustomEvent) {
    const { i, t } = event.currentTarget.dataset
    const { singleSel, selecteds, toChatTypeSelectedMap, pageState, curChats, searchedContacts, searchedGroups, indexListData } = this.data
    const { unameUserMap } = userStore
    let to: Users.Username | Groups.Id, chatType: ChatType, avatar: Users.Avatar
    if (pageState === PageState.recentChats) {
      ({ to, chatType, avatar } = curChats[i])
    } else {
      if (t) { // 通讯录搜索、群聊列表
        to = t === ChatType.single ? searchedContacts[i].username : searchedGroups[i].id
        chatType = t
        avatar = t === ChatType.single ? unameUserMap[to].avatar : searchedGroups[i].avatar
      } else { // 索引通讯录
        const indexes: string[] = i.split('-')
        let contact: Contact
        contact = indexListData[+indexes[0]].contacts[+indexes[1]]
        to = contact.username
        chatType = ChatType.single
        avatar = unameUserMap[to].avatar
      }
    }
    if (toChatTypeSelectedMap[to + '-' + chatType]) {
      selecteds.splice(selecteds.findIndex(c => c.to === to), 1)
      delete toChatTypeSelectedMap[to + '-' + chatType]
    } else {
      if (selecteds.length >= 100) {
        wx.showToast({ title: '最多选100个', icon: 'error' })
        return
      }
      selecteds.push({ to, chatType, avatar })
      toChatTypeSelectedMap[to + '-' + chatType] = true
    }
    this.setData({ selecteds, toChatTypeSelectedMap })
    if (singleSel && pageState === PageState.recentChats) {
      this.setData({ showDialog: true })
      return
    }
    this.unSearch()
    console.log({ selecteds })
  },
  search(e: VanInputEvent<string>) {
    const keyword = e.detail
    if (!keyword) {
      this.setData({ keyword, searchedContacts: [], searchedGroups: [], curChats: [] })
      return
    }
    const { chats, contacts, groups, unameUserMap, user: { username } } = userStore
    const { pageState, mode } = this.data
    if (pageState === PageState.recentChats) {
      const curChats = chats.filter(c => (c.type === 1 && (c.content as string).includes(keyword)) || c.nickname.includes(keyword))
      this.setData({ keyword, curChats })
    } else {
      let searchedGroups: GetGroupsRes[] = []
      if (mode !== ChooseMode.friends) {
        searchedGroups = groups!.filter(g => g.name.includes(keyword))
      }
      const searchedContacts = contacts.filter(c => c.username !== username && (unameUserMap[c.username].nickname.includes(keyword) || c.username.includes(keyword) || c.remark.includes(keyword)))
      this.setData({ keyword, searchedContacts, searchedGroups })
    }
  },
  unselect(e: WechatMiniprogram.CustomEvent) {
    const to: Users.Username = e.currentTarget.dataset.to
    const { selecteds, toChatTypeSelectedMap } = this.data
    const selected = selecteds.splice(selecteds.findIndex(c => c.to === to), 1)[0]
    delete toChatTypeSelectedMap[to + '-' + selected.chatType]
    this.setData({ selecteds: [...selecteds], toChatTypeSelectedMap })
  },
  storeBindings: {} as StoreBindings,
  finish() {
    const { mode } = this.data
    if (mode === ChooseMode.friends) {
      wx.navigateTo({ url: CreateGroupPath + '?data=' + JSON.stringify(this.data.selecteds.map(c => c.to)) })
    } else {
      this.setData({ showDialog: true })
    }
  },
  touchSearch() {
    this.setData({ listState: ListState.search, curChats: [], searchedContacts: [], searchedGroups: [] })
  },
  unSearch() {
    const { pageState } = this.data
    if (pageState === PageState.selectGroups) {
      this.setData({ listState: ListState.normal, searchedGroups: userStore.groups!, keyword: '' })
    } else {
      this.setData({ listState: ListState.normal, searchedContacts: [], curChats: userStore.chats, keyword: '' })
    }
  },
  toSelectContacts() {
    this.setData({ pageState: PageState.selectContacts, listState: ListState.normal, keyword: '' })
  },
  toRecentChats() {
    this.setData({ curChats: userStore.chats, pageState: PageState.recentChats, listState: ListState.normal, keyword: '' })
  },
  toSelectGroups() {
    this.setData({ pageState: PageState.selectGroups, listState: ListState.normal, searchedGroups: userStore.groups!, keyword: '' })
  },
  lookMore() {
    this.setData({ showMore: true })
  },
  messageInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ moreMsg: e.detail.value })
  },
  async confirm() { // todo 测试
    let { selecteds, moreMsg } = this.data
    moreMsg = moreMsg.trim()
    const { chatType, data, type, isMul } = stagingStore.chatLog
    const { user: { username }, contactMap } = userStore
    const isSingleTran = type === TransmitType.single
    if (!isSingleTran && data.some((m: SgMsg | GpMsg) => m.state)) {
      wx.showToast({ title: '合并转发的数据中不能含有未发出的消息', icon: 'error' })
      return
    }
    console.log(chatType, data, isMul, selecteds, type)
    wx.showLoading({ title: '加载中...' })
    for (const { to, chatType, avatar } of selecteds) {
      const isSingle = chatType === ChatType.single
      const fakeId = username + '-' + to + '-' + Date.now().toString(36)
      const messageInfo = app.getMessageInfo(to, chatType)
      const { messages } = messageInfo
      const lastId = messages.length ? messages[messages.length - 1].id! : null
      const msgs: Omit<SendSgMsgReq, 'to' | 'lastId'>[] = []
      let p: Promise<void>
      const newMsg = { content: moreMsg, type: MsgType.text, fakeId: fakeId + '-1' }
      let newMsgs: SgMsg[] = []
      if (isSingleTran) { // 逐条转发
        data.forEach((msg: SgMsg | GpMsg, i: number) => msgs.push({ content: msg.content, type: msg.type, fakeId: fakeId + i }))
        moreMsg && msgs.push(newMsg)
        p = chatSocket.send({
          action: isSingle ? TRANSMIT_SG_MSGS : TRANSMIT_GP_MSGS,
          data: { to, lastId, msgs }
        })
      } else {
        const ids = (data as SgMsg[]).map(({ id }) => id!)
        msgs.push({ content: { chatType, ids }, fakeId, type: MsgType.chatLogs })
        p = chatSocket.send({
          action: isSingle ? SEND_SG_MSG : SEND_GP_MSG,
          data: { to, content: { chatType, ids }, fakeId, type: MsgType.chatLogs, lastId }
        })
        if (moreMsg) {
          msgs.push(newMsg)
          chatSocket.send({
            action: isSingle ? SEND_SG_MSG : SEND_GP_MSG,
            data: { to, content: moreMsg, fakeId: newMsg.fakeId, type: MsgType.text, lastId }
          }).catch(() => newMsgs.find(m => m.fakeId === newMsg.fakeId)!.state = MsgState.error)
        }
      }
      const createdAt = formatDate()
      const fakeIds: SgMsgs.FakeId[] = []
      newMsgs = msgs.map(({ type, content, fakeId }) => {
        fakeIds.push(fakeId)
        const msg: SgMsg = {
          from: username,
          content,
          type,
          fakeId,
          state: MsgState.loading,
          createdAt,
          status: 0
        }
        messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(msg) - 1
        return msg
      })
      console.log(newMsgs[0].state)
      try {
        await p
      } catch (e) {
        newMsgs.forEach((msg: SgMsg | GpMsg) => msg.fakeId !== newMsg.fakeId && (msg.state = MsgState.error)) // 除去留言的消息
      }
      const nickname = isSingle ? contactMap[to].remark : (await userStore.getGroupIdGroupInfo(to as GpMsgs.To)).name
      app.saveChats({ ...newMsgs[newMsgs.length - 1], to: to as unknown as number }, { nickname, avatar }, 0, chatType)
      messageInfo.showedMsgsMinIndex += newMsgs.length
      messageInfo.maxMsgsIndex = messageInfo.loadedMsgsMinIndex + Math.floor((messageInfo.messages.length - 1) / SAVE_MESSAGE_LENGTH)
      app.setToSaveFakeIds(to, fakeIds, isSingle)
    }
    app.saveMessages()
    wx.hideLoading()
    wx.switchTab({ url: ChatsPath })
  },
  playAudio() {
    let { iac, BASE_URL, isAudioPlay } = this.data
    if (!iac) {
      iac = wx.createInnerAudioContext()
      iac.onEnded(() => this.setData({ isAudioPlay: false }))
      iac.onPause(() => this.setData({ isAudioPlay: false }))
      iac.onPlay(() => this.setData({ isAudioPlay: true }))
      iac.onError((res) => {
        console.log('音频播放异常', res)
        wx.showToast({ title: '音频播放异常' })
        this.setData({ isAudioPlay: false })
      })
      iac.src = BASE_URL + stagingStore.chatLog.data[0].content
      iac.play()
      this.setData({ iac })
    } else {
      isAudioPlay ? iac.pause() : iac.play()
      this.setData({ isAudioPlay: !isAudioPlay })
    }
  },
  toggleSel() {
    this.setData({ singleSel: !this.data.singleSel, selecteds: [], toChatTypeSelectedMap: {} })
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },
})