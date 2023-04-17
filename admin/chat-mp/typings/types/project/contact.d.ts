declare namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username
  export type Status = string
}

interface Contact {
  username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, status: Contacts.Status
}

interface ContactMap {
  [key: string]: Contact
}