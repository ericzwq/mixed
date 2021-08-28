// import http from './http'
var crypto = require('crypto')
// 登录加密
export function codeaes(data) {
    var iv = ""
    var key = '8NONwyJtHesysWpM'
    var clearEncoding = 'utf8'
    var cipherEncoding = 'base64'
    var cipherChunks = []
    var cipher = crypto.createCipheriv('aes-128-ecb', key, iv)
    cipher.setAutoPadding(true)
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding))
    cipherChunks.push(cipher.final(cipherEncoding))
    return cipherChunks.join('')
}

// // 反爬虫字符串
// function DateGet () {
//     // var oReq = new XMLHttpRequest();
//     // try {
//     //     let url = '/user/login/getUsers'
//     //     oReq.open("post", baseurl + url, false); // 同步请求 http://115.159.160.43
//     //     oReq.send(null);
//     //     return oReq.response
//     // } catch (e) {
//     //     console.log('获取秘钥失败')
//     // }
//     http.post('/user/login/getUsers').then(res => {
//         console.log(res)
//         return res
//     })
// }
// // 获取加密key
// var dateAES = DateGet()

/*
*cookie
*/
// 获取cookie
export function getCookie (cname) {
    var name = cname + "="
    var ca = document.cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)

        // console.log(c.substring(name.length, c.length))
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length)
    }
    return "";
}
// 设置cookie
export function setCookie (cname, cvalue, exdays) {
    var d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    var expires = "expires=" + d.toUTCString()
    document.cookie = cname + "=" + cvalue + "; " + expires + ';path = /'
}

//清除cookie
export function clearCookie () {
//   setCookie("hysjuid", "", -1) // 旧
  setCookie("token", "", -1) // wish2
//   setCookie('refreshToken', '', -1)
}

