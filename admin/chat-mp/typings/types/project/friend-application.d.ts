declare namespace FriendApplications {
  export type Reason = string
}
declare interface FriendApplication { from: Users.Username, reason: FriendApplications.Reason, nickname: Users.Nickname }