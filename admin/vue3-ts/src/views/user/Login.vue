<template>
  <div class="login-container">
    <el-form label-position="right" size="large" label-width="80px" :model="formData" :rules="rules" ref="formRef">
      <el-form-item label="用户名" prop="username">
        <el-input clearable v-model.trim="formData.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input clearable show-password v-model.trim="formData.password"
                  @keydown.enter="login"></el-input>
      </el-form-item>
      <el-form-item class="form-btn-box">
        <el-button type="primary" @click="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref} from "vue";
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import {ElMessage} from "element-plus";
import {codeaes} from '@/common/utils';
import {LOGIN_URL} from '@/http/urls';
import {REFRESH_TOKEN_KEY, TOKEN_KEY} from '@/common/consts';
import http from '@/http/http';
import {SuccessResponse} from "@/types/types";

const formRef = ref()
const formData = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    }
  ]
}
const router = useRouter()
const store = useStore()
const setLogin = (payload: boolean) => store.commit('user/setLogin', payload)

function login() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return;
    const params = {
      username: codeaes(formData.username),
      password: codeaes(formData.password)
    };

    http.get<never, SuccessResponse>(LOGIN_URL, {params}).then((r) => {
      if (![3, 1].includes(r.code)) return ElMessage.error(r.msg);
      localStorage.setItem(TOKEN_KEY, r.data[TOKEN_KEY]);
      localStorage.setItem(REFRESH_TOKEN_KEY, r.data[REFRESH_TOKEN_KEY]);
      http.defaults.headers.common[TOKEN_KEY] = r.data[TOKEN_KEY];
      setLogin(true);
      setTimeout(() => router.push('/'));
    });
  });
}
</script>

<style lang="scss" scoped>
.login-container {
  padding-top: 200px;
  padding-right: 20px;

  .form-btn-box {
    margin-top: 30px;

    :deep(.el-form-item__content) {
      justify-content: center;
    }
  }
}
</style>
