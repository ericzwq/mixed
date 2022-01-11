import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import {APP_BASE_PATH} from '@/common/consts';

export const LOGIN_PATH = '/login';
export const SAVE_PATH = '/save';
export const PRICE_PATH = '/price';
export const AUTHORIZE_PATH = '/authorize';
export const EDIT_LIMIT_PRICE_PATH = '/edit-limit-price';
export const HIDE_SLIDER_AND_HEADER_SET = new Set([LOGIN_PATH, SAVE_PATH, EDIT_LIMIT_PRICE_PATH]); // 需隐藏侧边栏和头部的路由列表
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: AUTHORIZE_PATH
  }, {
    path: SAVE_PATH,
    name: 'Save',
    component: () => import('@/views/save/index.vue')
  }, {
    path: LOGIN_PATH,
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
  }, {
    path: PRICE_PATH,
    name: 'Price',
    component: () => import('@/views/price/index.vue')
  }, {
    path: AUTHORIZE_PATH,
    name: 'Authorize',
    component: () => import('@/views/authorize/index.vue')
  }, {
    path: EDIT_LIMIT_PRICE_PATH,
    name: 'EditLimitPrice',
    component: () => import('@/views/price/EditLimitPrice.vue')
  }
]

const router = createRouter({
  history: createWebHistory(APP_BASE_PATH),
  routes
});

export default router;
