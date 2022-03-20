import Router = require('koa-router')
import user from './user/user'
import creation from './creation/creation'
import index from './index'

const router = new Router()
router.use('/', user.routes(), user.allowedMethods())
router.use('/', creation.routes(), creation.allowedMethods())
router.use('/', index.routes(), index.allowedMethods())
export default router
