declare namespace Groups {
  type Id = number
  type Name = string
  type Avatar = string
  type Leader = string
  type Manager = string
  type Managers = Set<string>
  type Member = string
  type Members = Set<string>
  type CreatedAt = string
}

declare namespace GpMsgs {
  type Id = number
  type Content = string | number[] | number
  type From = Users.Username
  type To = Groups.Id
  type FakeId = string // 前端消息id
  type CreatedAt = string
  type Ext = string
  type Next = Id | null
  type Pre = Id | null
  type Reads = Users.Username
  type ReadCount = number
}

declare namespace GpMembers {
  type prohibition = number
}

declare enum GpMemberOrigin {
  author = 0, // 创建者
  invitee = 1, // 被邀请
  apply = 2, // 申请
}

interface GpMsgReq {
  type: MsgType
  content: GpMsgs.Content
  fakeId: GpMsgs.FakeId
  ext?: GpMsgs.Ext
  lastId?: GpMsgs.Id
  to: GpMsgs.To
  pre: GpMsgs.Pre // 额外的
}

interface GpMsgRes {
  id: GpMsgs.Id
  type: MsgType
  fakeId?: GpMsgs.FakeId // 前端消息id
  from: GpMsgs.From
  to: GpMsgs.To
  createdAt?: GpMsgs.CreatedAt
  content: GpMsgs.Content
  status: MsgStatus
  next: GpMsgs.Next
  pre: GpMsgs.Pre
  readCount: GpMsgs.ReadCount
}

interface GpMsg extends Partial<GpMsgRes> {
  state?: 'loading' | 'error'
  isPlay?: boolean
}


interface Group {
  id: Groups.Id
  name: Groups.Name
  avatar: Groups.Avatar
  leader: Groups.Leader
  manager?: Groups.Manager
  managers: Groups.Managers
  member?: Groups.Member
  members: Groups.Members
  createdAt: Groups.CreatedAt
}

declare namespace GroupApls {
  type Id = Groups.Id
  type  Reason = string
  type Pre = Id
  type Next = Id
  type Invitee = Users.Username
  type From = Users.Username
  type CreatedAt = string

  enum Type {
    active = 1, // 加群申请
    passive = 2 // 邀请申请
  }

  enum Status {
    pending = 0,  // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

interface AddGroupReq {
  id: Groups.Id
  reason: GroupApls.Reason
}

interface GroupInviteRetReq {
  id: GroupApls.Id
  status: GroupApls.Status
}

interface GroupInviteRetRes {
  id: GroupApls.Id
  status: GroupApls.Status
  createdAt: GroupApls.CreatedAt
}

interface AddGroupRetReq {
  to: Users.Username
  status: GroupApls.Status
}

interface CreateGroupReq {
  members: Users.Username[]
  name: Groups.Name
  avatar?: Groups.Avatar
}

interface GroupInviteReq {
  members: Users.Username[]
  to: Groups.Id
}

interface GetGroupAplsReq {
  lastGroupAplId?: GroupApls.Id
}

interface ReadGpMsgsReq {
  ids: GpMsgs.Id[]
  to: GpMsgs.To
}

interface GetHisGpMsgReq {
  count: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}

interface File {
  size: number
  url: string
  type: string
}