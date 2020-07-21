<template>
    <div>
        <h3>这是Account组件</h3>
        <router-link to="/account/login">login</router-link>
        <router-link to="/account/register">register</router-link>
        <transition mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        name: "account"
    }
</script>

<style lang="less" scoped>
    .v-enter, .v-leave-to {
        transform: translateX(150px);
    }

    .v-enter-active, .v-leave-active {
        transition: all .2s;
    }

    * {
        font-weight: 900;
    }
</style>