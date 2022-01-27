type userState = {
  isLogin: boolean
}
export default {
  state: {
    isLogin: false
  },
  mutations: {
    setLogin(state: userState, v: boolean): void {
      state.isLogin = v;
    },
  }
};
