declare namespace Users {
  export type Username = string
  export type Password = string
  export type Nickname = string
  export type Avatar = string
  export type Email = string
  export type Code = string
}

interface User {
  username: Users.Username
  nickname: Users.Nickname
  avatar: Users.Avatar
  email: Users.Email
}

interface GroupUserInfo {
  username: Users.Username
  nickname: Users.Nickname
  avatar: Users.Avatar
  email: Users.Email
}

interface UnameUserMap {
  [key: string]: Omit<User, 'username'>
}