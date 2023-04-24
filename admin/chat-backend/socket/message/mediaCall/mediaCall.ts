import * as WebSocket from "ws";
import {SessionData} from "../../../router/user/user-types";
import {AnswerMessage, CandidateMessage, OfferMessage, VoiceResult} from "../../socket-types";
import {SocketResponseSchema} from "../../../response/response";
import {usernameClientMap} from "../chat/chat";

export function voiceResult(ws: WebSocket.WebSocket, session: SessionData, data: VoiceResult) {
  usernameClientMap[data.data.to]?.send(new SocketResponseSchema(data).toString())
}

export function candidate(ws: WebSocket.WebSocket, session: SessionData, data: CandidateMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.send(JSON.stringify(data))
}

export function offer(ws: WebSocket.WebSocket, session: SessionData, data: OfferMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.send(JSON.stringify(data))
}

export function answer(ws: WebSocket.WebSocket, session: SessionData, data: AnswerMessage) {
  data.status = 0
  usernameClientMap[data.data.to]?.send(JSON.stringify(data))
}