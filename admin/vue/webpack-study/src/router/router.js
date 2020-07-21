import VueRouter from 'vue-router';
import account from "../js/account.vue";
import login from "../js/login.vue";
import register from "../js/register.vue";

let router = new VueRouter({
    routes: [
        {
            path: '/account', component: account, children: [
                {path: '/account/login', component: login},
                {path: '/account/register', component: register}
            ]
        }
    ],
    linkActiveClass:'linked'
})
export default router;