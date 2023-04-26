import {Groups} from "../../socket-types";
import {Users} from "../../../router/user/user-types";

export namespace GroupApls {
  export type  Reason = string
  export type  Status = 0 | 1 | 2
}

export interface AddGroupBody {
  id: Groups.Id
  reason: GroupApls.Reason
}

export interface AddGroupRetBody {
  to: Users.Username
  status: GroupApls.Status // 0待确认 1同意 2拒绝
}