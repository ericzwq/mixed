Ajax.cancelToken = function (cb) {
  this.xhrList = []
  cb(() => this.resolve())
}

function Ajax(method, url, {cancelToken} = {}) {
  let xhr = new XMLHttpRequest()
  xhr.open(method, url)
  xhr.send()
  return new Promise(((resolve, reject) => {
    if (cancelToken) {
      cancelToken.xhrList.push(xhr)
      new Promise(resolve => cancelToken.resolve = resolve).then(r => cancelToken.xhrList.forEach(xhr => {
        if (xhr.readyState === 4) return
        xhr.abort()
        reject({cancel: true, message: '取消请求'})
      }))
    }
    xhr.onload = function () {
      let {status, responseText} = this
      if (!(status >= 200 && status < 300)) return reject(responseText)
      let data = responseText
      try {
        data = JSON.parse(data)
      } catch (e) {
      }
      resolve(data)
    }
    xhr.onerror = reject
  }))
}

let method = 'get', url = 'https://unpkg.com/element-ui@2.8.2/lib/theme-chalk/index.css', cancel, cancel2,
  cancelToken = new Ajax.cancelToken(c => cancel = c)
Ajax(method, url, {cancelToken}).then(r => console.log('success1'), e => console.log(e))
Ajax(method, url, {cancelToken: new Ajax.cancelToken(c => cancel2 = c)}).then(r => console.log('success2'), e => console.log(e))
cancel()
// cancel2()
