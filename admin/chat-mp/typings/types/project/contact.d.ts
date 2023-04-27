declare namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username
  export enum Status {
    normal = 0, // 正常
    delete = 1, // 已删除
    blackList = 2, // 黑名单
    delAndBlack = 3 // 删除并拉黑
  }

  export type Remark = string
}

interface Contact {
  username: Users.Username,
  nickname: Users.Nickname,
  avatar: Users.Avatar,
  status: Contacts.Status,
  remark: Contacts.Remark
}

interface ContactMap {
  [key: string]: Contact
}