import {SAVE_LOGIN} from "../action_types";

let initState = {username: 'zs', token: '', isLogin: false}
export default function (state = initState, action) {
  // console.error('login', {state, action})
  let {type, data} = action
  switch (type) {
    case SAVE_LOGIN:
      return {username: data.username, token: data.token, isLogin: true}
    default:
      return state
  }
}
