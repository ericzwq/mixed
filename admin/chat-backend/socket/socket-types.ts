import { Users } from "../router/user/user-types"

export namespace Messages {
	export type Target = string // '1-2'
	export type Content = string | number[]
	export type From = Users.Username
	export type To = Users.Username
	export type Type = number
	export type FackId = string // 前端消息id
	export type CreatedAt = string
	export type Status = number
}
export interface Message {
	action: string
	target: Messages.To
	from: Messages.From
	to: Messages.To
	type: Messages.Type
	content: Messages.Content
	fackId: Messages.FackId
	createdAt: Messages.CreatedAt
}

export interface SocketData {
	type: number // 1普通消息 2系统消息 3撤回消息
	fackId?: string // 前端消息id
	from: Users.Username
	to: Users.Username
	createdAt?: string
	data: Messages.Content
	status: Messages.Status
}

export namespace Voices {
	export type Action = string
	export type Agree = boolean
	export type To = string
}

export interface OfferMessage {
	status: number
	action: string
	data: {
		offer: any
		from: Users.Username
		to: Users.Username
	}
}

export interface AnswerMessage {
	status: number
	action: string
	data: {
		answer: any
		from: Users.Username
		to: Users.Username
	}
}

export interface CandidateMessage {
	status: number
	action: string
	data: {
		candidate: any
		from: Users.Username
		to: Users.Username
	}
}

export interface VoiceResult {
	action: Voices.Action
	data: {
		agree: Voices.Agree
		to: Voices.To
	}
}