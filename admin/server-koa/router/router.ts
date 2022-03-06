import Router = require('koa-router')
import user from './user/user'

const router = new Router()
router.use('/', user.routes(), user.allowedMethods())

export default router
