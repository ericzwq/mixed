<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <header v-if="!HIDE_SLIDER_AND_HEADER_SET.has($route.path)">
        <span class="title">海鹰数据</span>
        <el-menu
            mode="horizontal"
            text-color="#ffffff"
            active-text-color="#ffffff"
            background-color="#198EDE"
            :default-active="activeMenu" class="menu-box-hr" router>
          <el-menu-item :index="AUTHORIZE_PATH">
            <template #title>
              <span>授权</span>
            </template>
          </el-menu-item>
          <el-menu-item :index="PRICE_PATH">
            <template #title>
              <span>调价</span>
            </template>
          </el-menu-item>
        </el-menu>
        <el-dropdown class="dropdown" v-if="isLogin" @command="handleCommand">
        <span class="el-dropdown-link info">
          <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                     class="hy-mr-10"></el-avatar>
          你好<el-icon :size="15"><arrow-down/></el-icon>
        </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div class="btn-login" v-else>
          <router-link :to="LOGIN_PATH">
            <el-button type="text">登录</el-button>
          </router-link>
        </div>
      </header>
      <!--    <el-menu v-show="!HIDE_SLIDER_AND_HEADER_SET.has($route.path)"-->
      <!--             :default-active="activeMenu" class="menu-box-vt" router-->
      <!--             style="width: 200px" @open="handleOpen" @close="handleClose">-->
      <!--      &lt;!&ndash;          <el-menu-item :index="AUTHORIZE_PATH">&ndash;&gt;-->
      <!--      &lt;!&ndash;            <i class="el-icon-setting"></i>&ndash;&gt;-->
      <!--      &lt;!&ndash;            <span slot="title">授权</span>&ndash;&gt;-->
      <!--      &lt;!&ndash;          </el-menu-item>&ndash;&gt;-->
      <!--      &lt;!&ndash;          <el-submenu index="2">&ndash;&gt;-->
      <!--      &lt;!&ndash;            <template slot="title">&ndash;&gt;-->
      <!--      &lt;!&ndash;              <i class="el-icon-menu"></i>&ndash;&gt;-->
      <!--      &lt;!&ndash;              <span slot="title">调价</span>&ndash;&gt;-->
      <!--      &lt;!&ndash;            </template>&ndash;&gt;-->
      <!--      &lt;!&ndash;            <el-menu-item-group>&ndash;&gt;-->
      <!--      <el-menu-item :index="PRICE_PATH">限量调价</el-menu-item>-->
      <!--      &lt;!&ndash;              <el-menu-item index="2-2">自动调价</el-menu-item>&ndash;&gt;-->
      <!--      &lt;!&ndash;            </el-menu-item-group>&ndash;&gt;-->
      <!--      &lt;!&ndash;          </el-submenu>&ndash;&gt;-->
      <!--    </el-menu>-->
      <router-view v-if="finishedToken" class="content"/>
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import {
  AUTHORIZE_PATH,
  HIDE_SLIDER_AND_HEADER_SET,
  LOGIN_PATH,
  PRICE_PATH,
  SAVE_PATH
} from '@/router/router';
import {mapState, useStore} from 'vuex';
import {REFRESH_TOKEN_KEY, TOKEN_KEY} from '@/common/consts';
import {REFRESH_TOKEN_URL} from '@/http/urls';
import {defineComponent, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import http from "@/http/http";
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import {ArrowDown} from "@element-plus/icons-vue";

export default defineComponent({
  components: {
    ArrowDown
  },
  setup() {
    const activeMenu = ref(AUTHORIZE_PATH)
    const finishedToken = ref(false)
    const {isLogin} = mapState('user', ['isLogin'])
    const store = useStore()
    const setLogin = (payload: boolean) => store.commit('user/setLogin', payload)
    const route = useRoute()
    const router = useRouter()

    // 登出，方法名与command一致
    function logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      http.defaults.headers.common[TOKEN_KEY] = ''
      router.push(LOGIN_PATH)
    }

    // 点击右上角下拉选项
    type Command = 'logout'

    function handleCommand(command: Command) {
      const map = {
        logout
      }
      map[command]()
    }

    // 刷新token
    function refreshToken() {
      http.post<never, {
        [REFRESH_TOKEN_KEY]: string
        [TOKEN_KEY]: string
      }>(REFRESH_TOKEN_URL, {}, {
        headers: {
          [REFRESH_TOKEN_KEY]: localStorage.getItem(REFRESH_TOKEN_KEY) as string
        }
      }).then(r => {
        http.defaults.headers.common[TOKEN_KEY] = r[TOKEN_KEY]
        localStorage.setItem(TOKEN_KEY, r[TOKEN_KEY])
        finishedToken.value = true
      }, () => finishedToken.value = true)
    }

    // 校验登录
    function checkLogin() {
      let token = localStorage.getItem(TOKEN_KEY)
      setLogin(!!token)
      if (token) {
        if (!location.pathname.includes(SAVE_PATH)) {
          refreshToken()
          setInterval(refreshToken, 3000000) // 50分钟一次
        } else {
          finishedToken.value = true
        }
      } else {
        finishedToken.value = true
      }
    }

    // 处理菜单
    function handleMenu() {
      let {path} = route
      if (path === '/') path = AUTHORIZE_PATH
      activeMenu.value = path
    }

    watch(route, handleMenu)

    onMounted(() => {
      checkLogin()
      handleMenu()
    })

    return {
      AUTHORIZE_PATH,
      HIDE_SLIDER_AND_HEADER_SET,
      LOGIN_PATH,
      PRICE_PATH,
      SAVE_PATH,
      activeMenu,
      finishedToken,
      isLogin,
      store,
      locale: zhCn,

      setLogin,
      logout,
      handleCommand,
    }
  }
})
</script>

<style lang="scss" scoped>

.app-container {
  height: 100%;
  min-width: 1100px;

  header {
    height: 60px;
    background: $hyBlue;
    padding: 0 20px;
    margin-bottom: 20px;
    position: relative;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      width: 180px;
      display: inline-block;
      margin-right: 20px;
      font-weight: bold;
      font-size: 24px;
      line-height: 1;
      //position: absolute;
      //left: 20px;
      //top: 50%;
      //transform: translateY(-50%);
    }

    .dropdown, .btn-login {
      width: 100px;
      display: inline-block;
      //position: absolute;
      //top: 50%;
      //transform: translateY(-50%);
      color: #fff;
      cursor: pointer;
    }

    .dropdown {
      //right: 20px;

      .info {
        display: flex;
        align-items: center;
        height: 40px;
        line-height: 40px;
      }
    }

    .btn-login {
      //right: 20px;

      .el-button {
        color: #fff;
        font-size: 16px;
      }
    }
  }

  .menu-box-hr {
    background: $hyBlue;
    color: #fff;
    display: inline-block;
    border-bottom: none;

    li {
      &:focus {
        background: none;
      }
    }
  }

  .content {
    overflow: hidden;
    margin-right: 20px;
    //border: 1px solid #ccc;
    border-radius: 3px;
  }

  .menu-box-hr:not(.el-menu--collapse) {
    flex-grow: 1;
  }

  .menu-box-vt {
    //height: calc(100% - 100px);
    float: left;
    //border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 0 5px #ccc;
    margin: 0 20px;
  }

  .menu-box-vt:not(.el-menu--collapse) {
    width: 200px;
    //min-height: 400px;
  }
}
</style>
