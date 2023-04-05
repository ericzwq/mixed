import Router = require('koa-router')
import user from './user/user'
import contact from './contact/contact'

const router = new Router()
router.use('/', user.routes(), user.allowedMethods())
router.use('/', contact.routes(), user.allowedMethods())
export default router
