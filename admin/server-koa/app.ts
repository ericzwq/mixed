const Koa = require('koa')
import router from './router/router'

const app = new Koa()

app.use(ctx => {
  ctx.body = ({ok: true})
})

const PORT = 5000
app.listen(PORT, () => console.log('server is start at post: ' + PORT))
