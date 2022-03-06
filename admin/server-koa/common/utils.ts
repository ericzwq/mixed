export const filterQuery = function (query: any): any {
  query.page = parseInt(query.page)
  query.count = parseInt(query.count)
  if (isNaN(query.page) || isNaN(query.count)) {
    query.page = 1
    query.count = 100
  }
  return query
}

export const setExcelType = function (res: any) {
  // res.setHeader('Content-Type', 'application/vnd.ms-excel') // application/vnd.openxmlformats
  // res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx')
}
