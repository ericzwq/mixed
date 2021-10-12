class Promise {
  status = 'pending'
  data
  resolveList = []
  rejectList = []

  resolve(data) {
    if (this.status !== 'pending') return
    this.data = data
    this.status = 'resolved'
    setTimeout(() => {
      this.resolveList.forEach(resolve => resolve && resolve())
      this.resolveList.length = 0
    })
  }

  reject(reason) {
    if (this.status !== 'pending') return
    this.data = reason
    this.status = 'rejected'
    setTimeout(() => {
      if (!this.rejectList.length) throw this.data
      this.rejectList.forEach(reject => reject && reject())
      this.rejectList.length = 0
    })
  }

  constructor(executor) {
    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (reason) {
      return new Promise((resolve, reject) => {
        reject(reason)
      })
    }
  }

  catch(onReject) {
    return this.then(undefined, onReject)
  }

  then(onResolve, onReject) {
    // console.warn(this.status, {onResolve, onReject})
    let handle = (cb, resolve, reject) => {
      if (!cb) return reject(this.data)
      try {
        let res = cb(this.data)
        if (res instanceof Promise) {
          res.then(resolve, reject)
        } else {
          resolve(res)
        }
      } catch (reason) {
        reject(reason)
      }
    }
    if (this.status === 'resolved') {
      return new Promise((resolve, reject) => {
        this.resolveList.push(() => {
        })
        this.rejectList.push(() => {
        })
        setTimeout(() => {
          if (!onResolve) return resolve()
          handle(onResolve, resolve, reject)
          // try {
          //   let res = onResolve(this.data)
          //   if (res instanceof Promise) {
          //     res.then(resolve, reject)
          //   } else {
          //     resolve(res)
          //   }
          // } catch (reason) {
          //   reject(reason)
          // }
        })
      })
    } else if (this.status === 'rejected') {
      return new Promise((resolve, reject) => {
        this.resolveList.push(() => {
        })
        this.rejectList.push(() => {
        })
        setTimeout(() => {
          if (!onReject) return reject(this.data)
          // if (!onReject) throw this.data
          handle(onReject, resolve, reject)
          // try {
          //   let res = onReject(this.data)
          //   if (res instanceof Promise) {
          //     res.then(resolve, reject)
          //   } else {
          //     resolve(res)
          //   }
          // } catch (reason) {
          //   reject(reason)
          // }
        })
      })
    } else { // pending
      return new Promise((resolve, reject) => {
        this.resolveList.push(() => {
          if (!onResolve) return resolve()
          handle(onResolve, resolve, reject)
          // try {
          //   let res = onResolve(data)
          //   if (res instanceof Promise) {
          //     res.then(resolve, reject)
          //   } else {
          //     resolve(res)
          //   }
          // } catch (reason) {
          //   reject(reason)
          // }
        })
        this.rejectList.push(() => {
          if (!onReject) return reject(this.data)
          // if (!onReject) throw this.data
          try {
            let err = onReject(this.data)
            resolve(err)
          } catch (reason2) {
            reject(reason2)
          }
        })
      })
    }
  }

  static race(promises) {
    return new Promise((resolve, reject) => promises.forEach(p => p.then(resolve, reject)))
  }

  static all(promises) {
    let len = promises.length, res = [], finished = 0
    return new Promise((resolve, reject) => {
      promises.forEach((p, i) => {
        p.then(r => {
          res[i] = r
          if (++finished === len) resolve(res)
        }, reject)
      })
    })
  }

  static resolve(v) {
    return new Promise(resolve => resolve(v))
  }

  static reject(v) {
    return new Promise((resolve, reject) => reject(v))
  }
}
