export const isProduction = process.env.NODE === 'production'

export function deepClone<T>(o: T): T {
  if (typeof o !== 'object') return o
  if (Array.isArray(o)) return o.map(deepClone) as unknown as T
  const res = {} as T
  Object.keys(o).forEach(k => res[k] = deepClone(o[k]))
  return res
}

export function urlSerialize(url: string, o: unknown) {
  let s = paramsSerialize(o)
  s = s[0] === '&' ? s.slice(1) : s
  return url + (s ? (url.lastIndexOf('?') > -1 ? '&' : '?') + s : '')
}

function paramsSerialize(o: unknown, s = ''): string {
  return typeof o === 'object' ?
    (o != null ?
        Object.keys(o).reduce((p, c) => p + (o[c] != null ? '&' + c + '=' + paramsSerialize(o[c]) : ''), s)
        : s
    )
    : s + o
}
