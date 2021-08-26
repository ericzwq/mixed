<template>
    <div class="main-app-login">
        <!-- <h1></h1> -->
        <div class="top-header">
            <p class="login-title">海鹰数据(extension)</p>
            <img class="close-btn" @click="closePop" src="../../assets/img/login-close.svg" alt="关闭">
        </div>
        <div v-if="!isLogined" class="login-box">
            <el-row class="input-row">
                <p class="input-label">用户名/手机号:</p>
                <el-input type="text" v-model="params.username" placeholder="6-16位数字组成或字母组成"></el-input>
                </el-row>
            <el-row class="input-row">
                <p class="input-label">密码:</p>
                <el-input type="password" v-model="params.password" placeholder="6-16位数字组成或字母组成"></el-input>
                <div class="txt-right">
                    <span class="forgot-btn" @click="goForgetPwd">忘记密码</span>
                </div>
            </el-row>
            <el-row class="input-row">
                <el-button type="primary" class="login-btn" @click="login">登&emsp;录</el-button>
                <p class="regist-tip">
                    没有账号？ <span class="go-regist-btn" @click="goSignUP">免费注册</span>
                </p>
            </el-row>
        </div>
        <div v-else class="user-info-box-hy">
            <el-row class="user-info-row">
                <p class="user-info-title">用户信息</p>
            </el-row>
            <!-- <el-button @click="reload">加载</el-button> -->
            <el-row class="user-info-row">
                <el-col class="info-row-label" :span="12">用 户 名：</el-col>
                <el-col class="info-row-value"  :span="12">{{userInfo.username || '--'}}</el-col>
            </el-row>
            <el-row class="user-info-row">
                <el-col class="info-row-label" :span="12">手 机 号：</el-col>
                <el-col class="info-row-value"  :span="12">{{userInfo.phoneNum || '--'}}</el-col>
            </el-row>
            <el-row class="user-info-row">
                <el-col class="info-row-label" :span="12">登陆时间：</el-col>
                <el-col class="info-row-value"  :span="12">{{lastLoginTime || '--'}}</el-col>
            </el-row>
            <!-- <el-row class="user-info-row">
                <el-col class="info-row-label" :span="12">公  司：</el-col>
                <el-col class="info-row-value"  :span="12">{{userInfo.compony || '--'}}</el-col>
            </el-row> -->
            <el-row class="user-info-row">
                <el-button type="danger" @click="logOut" size="small">退出登录</el-button>
            </el-row>
        </div>

        <el-dialog title="您已登录成功" :visible.sync="loginSuccessVisible" width="500px">
            <div slot="title" class="dialog-title">
                您已登录成功!
            </div>
            <div class="success-pop-box">
                <p class="pop-tip">现在前往：(以下为目前我们插件支持的站点)</p>
                <el-row class="pop-row">
                    <el-col :span="5" class="pop-station">Shopee：</el-col>
                    <el-col :span="19">
                        <!-- <a href="https://shopee.com.my/">马来西亚站</a>
                        <a href="https://xiapi.xiapibuy.com/">台湾站</a>
                        <a href="https://shopee.co.id/">印度尼西亚站</a>
                        <a href="https://shopee.co.th/">泰国站</a>
                        <a href="https://shopee.ph/">菲律宾站</a>
                        <a href="https://shopee.sg/">新加坡站</a>
                        <a href="https://shopee.vn/">越南站</a>
                        <a href="https://shopee.com.br/">巴西站</a> -->

                        <a href="https://my.xiapibuy.com/">马来西亚站</a>
                        <a href="https://xiapi.xiapibuy.com/">台湾站</a>
                        <a href="https://id.xiapibuy.com/">印度尼西亚站</a>
                        <a href="https://th.xiapibuy.com/">泰国站</a>
                        <a href="https://ph.xiapibuy.com/">菲律宾站</a>
                        <a href="https://sg.xiapibuy.com/">新加坡站</a>
                        <a href="https://vn.xiapibuy.com/">越南站</a>
                        <a href="https://br.xiapibuy.com/">巴西站</a>
                    </el-col>
                </el-row>
                <el-row class="pop-row">
                    <el-col :span="5" class="pop-station">Amazon：</el-col>
                    <el-col :span="19">
                        <a href="https://www.amazon.com/">美国站</a>
                        <a href="https://www.amazon.co.jp/">日本</a>
                        <a href="https://www.amazon.co.uk/">英国站</a>
                        <a href="https://www.amazon.de/">德国站</a>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { codeaes } from '../../common/utool'
import http from '../../common/http'
import moment from 'moment'
export default {
    name: "app",
    data() {
        return {
            params: {
                username: '',
                password: ''
            },
            userkeyaes: '',
            passwordkeyaes: '',
            tabId: '',
            loginSuccessVisible: false,
            isLogined: false,
            userInfo: {},
            lastLoginTime: '',
            refresh_token: ''
        }
    },
    created () {
        // alert('触发')
    },
    mounted () {
        let _this = this
        chrome.storage.local.get(['haiying_token', 'hy_loginDate', 'refresh_token'], function (result) {
          console.log('popup', Date.now())
            if (result.haiying_token) {
                // console.log('token', result.haiying_token)
                _this.isLogined = true
                http.defaults.headers.common['token'] = result.haiying_token || ''

                _this.lastLoginTime = result.hy_loginDate || ''
                _this.refresh_token = result.refresh_token

                _this.geUserInfo()
            }
        })
    },
    methods: {
        // goBack () {
        //     let url = 'https://haiyingshuju.com/newsAmazon/index.html#/commodity'
        //     window.open(url)
        // },
        login () {
            if (this.params.username === '') {
                // this.prompt = '用户名不能为空';
                this.$swal({
                    title: '用户名不能为空',
                    text: '您输入的用户名为空，请重新输入',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: '确定'
                })
                return;
            }
            if (this.params.password === '') {
                this.$swal({
                    title: '密码不能为空',
                    text: '您输入的密码为空，请重新输入',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: '确定'
                })
                return;
            }
            this.userkeyaes = codeaes(this.params.username)
            this.passwordkeyaes = codeaes(this.params.password)

            this.landing();
        },
        landing () {
            http.defaults.headers.common['token'] = ''
            let params = {
                username: this.userkeyaes,
                password: this.passwordkeyaes
            }

            http({
                url: '/auth/login',
                method: 'post',
                data: params,
                transformRequest: [function (data) {
                    let ret = ''
                    for (let it in data) {
                        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                    }
                    return ret
                }],
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                if (res.data.code === 1 || res.data.code === 3) {
                    let loginDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    chrome.storage.local.set({haiying_token: res.headers.token, refresh_token: res.headers['refresh-token'], hy_loginDate: loginDate}, function () {})
                    // this.loginSuccessVisible = true
                    http.defaults.headers.common['token'] = res.headers.token

                    this.geUserInfo()
                    this.lastLoginTime = loginDate
                    this.isLogined = true

                    // chrome.runtime.sendMessage({
                    //     token: res.headers.token,
                    //     loginedReload: true
                    // })
                    this.sendRefresh()
                } else if (res.data.code === 0) {
                    this.$swal({
                        title: '用户名或密码错误',
                        text: '您输入的用户名或密码错误，请重新输入',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: '确定'
                    })
                }
            })
        },


        // 前往注册
        goSignUP () {
            // location.href = 'https://haiyingshuju.com/wish/index.html#/regist?extension="1"'
            window.open('https://haiyingshuju.com/wish/index.html#/regist?extension="1"')
        },
        // 前往修改密码
        goForgetPwd () {
            window.open('https://haiyingshuju.com/wish/index.html#/forgotPwd')
        },
        // 关闭窗口
        closePop () {
            window.location.href="about:blank"
            window.close();
        },

        // 获取个人信息
        geUserInfo () {
            http.post('/user/userInfo/info').then(res => {
                if (res.data.code == 1) {
                    this.userInfo = res.data.data || {}
                } else if (res.data.code == 401) {
                    this.RefreshLogin().then(() => {
                        this.geUserInfo()
                    })
                }
            })
        },

        // 退出登录
        logOut () {
            chrome.storage.local.remove(['haiying_token', 'refresh_token', 'hy_loginDate']) // 删除key
            http.defaults.headers.common['token'] = ''
            this.isLogined = false
            this.sendRefresh()
        },

        reload () {
            // location.reload()
            // chrome.runtime.sendMessage({
            //     loginedReload: true
            // })
            // chrome.tabs.getSelected(null, function(tab) {
            //     console.log(tab)
            // });
            chrome.tabs.query({}, function(tab) {
                console.log(tab)
            });
        },

        // 向相关页面发送刷新请求
        sendRefresh () {
            chrome.tabs.query({}, function(tab) {
                // console.log(tab)
                if(tab[0]) {
                    tab.forEach(item => {
                        if (
                            item.favIconUrl.indexOf('amazon.') !== 1 ||
                            item.favIconUrl.indexOf('shopee.') !== 1 ||
                            item.favIconUrl.indexOf('xiapibuy.') !== 1
                        ) {
                            chrome.tabs.sendMessage(item.id, {loginRefresh: true})
                        }
                    })
                }
            });
        },

        // 刷新token
        RefreshLogin () {
            return http({
                method: 'post',
                url: '/auth/login/refreshToken',
                headers: { 'refresh-token': this.refresh_token }
            }).then( res => {
                if(res.data.code == 402) {
                    chrome.storage.local.set({haiying_token:  res.data.token, refresh_token: res.headers['refresh-token']})
                    http.defaults.headers.common['token'] = res.data.token
                    // 重新赋值
                    // this.token = res.data.token
                    // this.refresh_token = res.headers['refresh-token']

                } else if(res.data.code == 500) {
                    http.defaults.headers.common['token'] = ''
                    chrome.storage.local.remove('haiying_token')
                    chrome.storage.local.remove('hy_loginDate')
                    location.reload()
                }
                return res.data.code
            })
        }
    }
};
</script>

<style lang="scss">
body {
    margin: 0 !important;
}

.txt-right {
    text-align: right;
}
.main-app-login {
    width: 560px;
    // font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    padding-bottom: 30px;
    background-color: #f5f7f8;
    border-radius: 10px;

    .top-header {
        line-height: 45px;
        text-align: center;
        font-size: 18px;
        // font-weight: 700;
        color: #fff;
        background-color: #198ede;
        position: relative;
        margin-bottom: 30px;


        .login-title {
            margin: 0;
        }

        .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
    }
}

.login-box {
    width: 350px;
    margin: 0 auto;
    padding: 20px 30px;
    // border: 1px solid #e2e2e2;
    // border-radius: 4px;
    // box-shadow: 0 0 10px #ddd;
    // background-color: #fff;
    padding-bottom: 30px;

    .box-title {
        font-size: 20px;
        font-weight: 700;
        color: #198ede;
        text-align: center;
    }

    .input-row {
        margin-top: 25px;
        .input-label {
            font-size: 12px;
            color: #666;
            margin: 5px;
            text-align: left;
        }
    }

    .login-btn {
        width: 100%;
    }

    .forgot-btn {
        display: inline-block;
        padding-top: 5px;
        color: #aaa;
        font-size: 14px;
        cursor: pointer;
        &:hover {
            color: #198ede;
        }
    }

    .regist-tip {
        font-size: 14px;
        color: #666;
        .go-regist-btn {
            color: #198ede;
            cursor: pointer;
        }
    }
}

.user-info-box-hy {
    width: 400px;
    margin: 0 auto;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    .user-info-row {
        line-height: 50px;
        font-size: 14px;
        color: #333;
        border-bottom: 2px solid #f5f7f8;

        .user-info-title {
            font-size: 18px;
            font-weight: 700;
            color: #198ede;
            margin: 5px;
        }

        .info-row-label {
            text-align: right;
            border-right: 1px solid #f5f7f8;
            padding-right: 5px;
        }
        .info-row-value {
            padding-left: 15px;
            text-align: left;
        }
    }
}

// 弹出层
.dialog-title {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    // line-height: 50px;
    color: #555;
}
.success-pop-box {
    text-align: left;
    padding-bottom: 15px;
    .pop-tip {
        font-size: 16px;
        margin-top: 0px;
    }

    // .pop-row:nth-child(2){
    //     padding-bottom: 15px;
    // }

    .pop-row {
        padding-bottom: 15px;
        .pop-station {
            font-size: 16px;
            font-weight: 700;
            text-align: right;
        }

        a {
            display: inline-block;
            width: 100px;
            color: #198ede;
            text-decoration: none;
            // text-align: right;
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
