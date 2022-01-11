type userState = {
  isLogin: boolean
}
export default {
  state: {
    isLogin: false
  },
  mutations: {
    setLogin(state: userState, v: boolean) {
      state.isLogin = v;
    },
  }
};
