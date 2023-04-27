import {Groups} from "../../socket-types";
import {Users} from "../../../router/user/user-types";

export namespace GroupApls {
  export type  Reason = string

  export enum Status {
    pending = 0,  // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

export interface AddGroupBody {
  id: Groups.Id
  reason: GroupApls.Reason
}

export interface AddGroupRetBody {
  to: Users.Username
  status: GroupApls.Status
}