import * as session from 'koa-session'
import client from '../redis/redis'

export const sessionKey = 'session-id'

const sessionConfig: Partial<session.opts> & { key: string } = {
	key: sessionKey, /**  cookie的key。 (默认是 koa:sess) */
	maxAge: 400000000, /**  session 过期时间，以毫秒ms为单位计算 。*/
	autoCommit: true, /** 自动提交到响应头。(默认是 true) */
	overwrite: true, /** 是否允许重写 。(默认是 true) */
	httpOnly: true, /** 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) */
	signed: true, /** 是否签名。(默认是 true) */
	rolling: false, /** 是否每次响应时刷新Session的有效期。(默认是 false) */
	renew: true, /** 是否在Session快过期时刷新Session的有效期。(默认是 false) */
	store: {
		async set(key, sess) {
			// console.log('set', key, sess)
			if (sess.login) { // 处理单端登录
				client.del([await client.get(sess.username!) || ''])
				client.set(sess.username!, key)
			}
			client.set(key, JSON.stringify(sess)).then(null, e => console.log('redis写入失败', e))
		},
		async get(key) {
			// console.log('get', key)
			return JSON.parse(await client.get(key) || '{}')
		},
		destroy(key) {
			console.log('destroy', key)
		}
	},
}
export default sessionConfig
