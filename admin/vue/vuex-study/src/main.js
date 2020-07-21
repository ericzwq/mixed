import Vue from 'vue';
import Vuex from 'vuex';
import App from "./App.vue";

Vue.use(Vuex);
let store = new Vuex.Store({
    state: {
        number: 0
    },
    mutations: {
        add() {
            this.state.number++;
        },
        minus() {
            this.state.number--;
        }
    },
    getters: {
        newNum: (state) => state.number + 'new'
    }
});
new Vue({
    el: '#app',
    data: {},
    render: c => c(App),
    store
})