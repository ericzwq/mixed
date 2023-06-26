import {TransmitType} from "../pages/chat-detail/chat-detail-types";
import {ChatType} from "../socket/socket-types";
import {userStore} from "./user";

// 暂存数据，不做视图更新
const store = {
  chatLog: {
    type: TransmitType.single,
    isMul: false, // 是否多选
    data: [] as SgMsg[] | GpMsg[], // 转发的数据
    chatType: ChatType.single,
    members: [] as Users.Username[], // 聊天中参与的成员
    title: '',
    async computeChatLogTitle(members: Users.Username[], chatType: ChatType) { // 计算聊天记录标题
      if (chatType === ChatType.group) return '群聊中的聊天记录'
      if (members.length === 1) {
        return (await userStore.getUsers([members[0]]))[0].nickname + '的聊天记录'
      } else {
        return (await userStore.getUsers([members[0]]))[0].nickname + '与' + (await userStore.getUsers([members[1]]))[0].nickname + '的聊天记录'
      }
    }
  },
}

export const stagingStore = store