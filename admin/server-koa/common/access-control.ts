export function accessControl(req, res, access, status) {
  if (access.length < 1) return
  let level = req.headers['level']
  if (access.indexOf(level) > -1) return true
  return res.json({message: '无权访问', status: status || 1}) === 1
}
