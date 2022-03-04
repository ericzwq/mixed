export function checkParams(ctx, config, params, status) {
  const numReg = /^-?\d+$/
  status = status || 1
  for (let i = 0; i < config.length; i++) {
    const item = config[i]
    if (!item) continue
    const k = item.k
    let v = params[k]
    const max = item.max
    const min = item.min
    const type = item.type
    const m = item.m
    const validator = item.validator
    const reg = item.reg
    if (!v && (v !== 0)) return !(ctx.body = {message: m || `参数${k}缺失`, status})
    if (validator) { // 校验函数优先
      const r = validator(v)
      if (!r.valid) {
        const m = r.m
        return !(ctx.body = {message: m ? '参数' + k + m : `参数${k}非法`, status})
      }
    } else if (item.reg) { // 正则
      if (!reg.test(v)) return !(ctx.body = {message: m || `参数${k}格式非法`, status})
    } else {
      if (type) {
        if (type === 'string') { // 字符串
          if (max && v.toString().length > max) {
            return !(ctx.body = {message: m || `参数${k}的长度须小于或等于${max}`, status})
          } else if (min && v.toString().length < min) {
            return !(ctx.body = {message: m || `参数${k}的长度须大于或等于${min}`, status})
          }
        } else if (type === 'array') { // 数组
          if (!Array.isArray(v)) return !(ctx.body = {message: m || `参数${k}须为数组`, status})
        } else if (type === 'email') { // 邮箱
          if (!/\w+@\w+.\w+$/.test(v)) return !(ctx.body = {message: m || '邮箱格式错误', status})
          v = v.toString()
          if (max && v.length > max) {
            return !(ctx.body = {message: m || `参数${k}的长度须小于或等于${max}`, status})
          } else if (min && v.length < min) {
            return !(ctx.body = {message: m || `参数${k}的长度须大于或等于${min}`, status})
          }
        } else if (type === 'enum') { // 枚举
          if (item['enum'].indexOf(v) < 0) return !(ctx.body = {message: m || `参数${k}的值非法`, status})
        } else if (type === 'date') { // 日期
          if (isNaN(new Date(v).valueOf())) return !(ctx.body = {message: m || `参数${k}格式错误`, status})
        } else {
          throw Error('校验类型错误')
        }
      } else { //默认为整数
        if (!numReg.test(v)) return !(ctx.body = {message: m || `参数${k}须为整数`, status})
        if (min && v < min) {
          return !(ctx.body = {message: m || `参数${k}须大于或等于${min}`, status})
        } else if (max && v > max) {
          return !(ctx.body = {message: m || `参数${k}须小于或等于${max}`, status})
        }
      }
    }
  }
  return true
}
