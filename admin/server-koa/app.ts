const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
import router from './router/router'

const app = new Koa()
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

const PORT = 5000
app.listen(PORT, () => console.log('server is start at post: ' + PORT))
