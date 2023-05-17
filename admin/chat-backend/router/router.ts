import Router = require('koa-router')
import user from './user/user'
import upload from "./upload/upload";

const router = new Router()
router.use('/', user.routes(), user.allowedMethods())
router.use('/', upload.routes(), upload.allowedMethods())
export default router
