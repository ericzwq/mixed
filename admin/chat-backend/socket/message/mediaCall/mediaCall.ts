import {User} from "../../../router/user/user-types";
import {AnswerMessage, CandidateMessage, ExtWebSocket, OfferMessage, VoiceResult} from "../../socket-types";
import {usernameClientMap} from "../single/single";

export function voiceResult(ws: ExtWebSocket, session: User, data: VoiceResult) {
  usernameClientMap[data.data.to]?.json(data)
}

export function candidate(ws: ExtWebSocket, session: User, data: CandidateMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}

export function offer(ws: ExtWebSocket, session: User, data: OfferMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}

export function answer(ws: ExtWebSocket, session: User, data: AnswerMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}