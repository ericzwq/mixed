import {TransmitType} from "../pages/chat-detail/chat-detail-types";
import {ChatType} from "../socket/socket-types";

// 暂存数据，不做视图更新
const store = {
  chatLog: {
    type: TransmitType.single,
    isMul: false, // 是否多选
    data: [] as SgMsg[] | GpMsg[], // 转发的数据
    chatType: ChatType.single,
    members: [] as Users.Username[], // 聊天中参与的成员
    title: '',
    setMembers(members: Users.Username[], unameUserMap: UnameUserMap) {
      this.members = members
      if (members.length === 1) {
        this.title = unameUserMap[members[0]].nickname + '的聊天记录'
      } else {
        this.title = unameUserMap[members[0]].nickname + '与' + unameUserMap[members[1]].nickname + '的聊天记录'
      }
    }
  },
}

export const stagingStore = store