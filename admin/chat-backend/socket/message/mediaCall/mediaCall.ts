import {SessionData} from "../../../router/user/user-types";
import {AnswerMessage, CandidateMessage, ExtWebSocket, OfferMessage, VoiceResult} from "../../socket-types";
import {usernameClientMap} from "../chat/chat";

export function voiceResult(ws: ExtWebSocket, session: SessionData, data: VoiceResult) {
  usernameClientMap[data.data.to]?.json(data)
}

export function candidate(ws: ExtWebSocket, session: SessionData, data: CandidateMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}

export function offer(ws: ExtWebSocket, session: SessionData, data: OfferMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}

export function answer(ws: ExtWebSocket, session: SessionData, data: AnswerMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.json(data)
}