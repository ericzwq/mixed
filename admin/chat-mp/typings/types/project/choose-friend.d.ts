declare enum ListState {
  normal = 1,
  search = 2
}

declare enum ChooseMode {
  friends = '1', // 选择好友
  chats = '2', // 选择聊天
}

declare enum PageState {
  recentChats = '1', // 最近聊天
  selectContacts = '2', // 选择联系人
  selectGroups = '3', // 选择群聊
}

interface Selected {
  to: Users.Username | Groups.Id
  chatType: ChatType
  avatar: Users.Avatar
}