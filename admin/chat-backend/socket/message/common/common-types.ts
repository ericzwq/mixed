import {SgMsgs} from '../single/single-types'

export enum ChatType {
  single = '1',
  group = '2'
}

export interface ChatLog {
  chatType: ChatType
  ids: SgMsgs.Id[]
}
