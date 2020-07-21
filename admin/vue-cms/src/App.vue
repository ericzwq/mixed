<template>
  <div class="app_container">
    <!--Header-->
    <mt-header fixed :title="title">
      <a href="javascript:history.back();" slot="left">
        <mt-button icon="back" v-show="$route.path !== '/home'">返回</mt-button>
      </a>
    </mt-header>
    <!--Content-->
    <transition mode="out-in">
      <keep-alive exclude="cart,search">
        <router-view></router-view>
      </keep-alive>
    </transition>
    <!--Footer-->
    <nav class="mui-bar mui-bar-tab">
      <router-link class="mui-tab-item-cc" to="/home">
        <span class="mui-icon mui-icon-home"></span>
        <span class="mui-tab-label">首页</span>
      </router-link>
      <router-link class="mui-tab-item-cc" to="/user">
        <span class="mui-icon mui-icon-contact"></span>
        <span class="mui-tab-label">会员</span>
      </router-link>
      <router-link class="mui-tab-item-cc" to="/cart">
        <span class="mui-icon mui-icon-extra mui-icon-extra-cart"><span class="mui-badge" id="badge">{{ $store.state.count }}</span></span>
        <span class="mui-tab-label">购物车</span>
      </router-link>
      <router-link class="mui-tab-item-cc" to="/search">
        <span class="mui-icon mui-icon-search"></span>
        <span class="mui-tab-label">搜索</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
  export default {
    name: 'App',
    computed: {
      title() {
        let title = '';
        let path = this.$route.path;
        if (path === '/home') {
          title = '天才商城-首页';
        } else if (path === '/user') {
          title = '天才商城-个人中心';
        } else if (path === '/cart') {
          title = '天才商城-购物车';
        } else if (path === '/search') {
          title = '天才商城-搜索中心';
        } else if (path === '/home/newslist') {
          title = '天才商城-新闻资讯';
        } else if (path.indexOf('/home/newscontent') === 0) {///\/home\/newscontent/.test(path)
          title = '天才商城-新闻详情';
        } else if (path.indexOf('/home/photolist') === 0) {
          title = '天才商城-图片分享';
        } else if (path.indexOf('/home/photocontent') === 0) {
          title = '天才商城-图片详情'
        } else if (path.indexOf('/home/goodslist') === 0) {
          title = '天才商城-商品列表'
        } else if (path.indexOf('/home/goodscontent') === 0) {
          title = '天才商城-商品详情'
        } else if (path.indexOf('/home/goodsdesc') === 0) {
          title = '天才商城-图文介绍'
        }
        return title;
      }
    }
  }
</script>

<style>
  html, body {
    height: 100%;
  }
</style>
<style lang="less" scoped>
  .app_container {
    min-width: 320px;
    height: 100%;
    max-width: 750px;
    padding-top: 40px;
    padding-bottom: 50px;
    margin: 0 auto;
    overflow-x: hidden;

    header, nav {
      width: 100%;
      /*max-width: 750px;*/
      margin: 0 auto;
      z-index: 1000;
    }
  }

  .v-enter {
    /*transform: translateX(100%);*/
  }

  .v-leave-to {
    transform: translateX(-100%);
    position: absolute;
  }

  .v-enter-active, .v-leave-active {
    transition: all .3s;
  }

  /*these can to resolve the route toggle problem*/
  .mui-bar-tab .mui-tab-item-cc.mui-active {
    color: #007aff;
  }

  .mui-bar-tab .mui-tab-item-cc {
    display: table-cell;
    overflow: hidden;
    width: 1%;
    height: 50px;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #929292;
  }

  .mui-bar-tab .mui-tab-item-cc .mui-icon {
    top: 3px;
    width: 24px;
    height: 24px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .mui-bar-tab .mui-tab-item-cc .mui-icon ~ .mui-tab-label {
    font-size: 11px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>