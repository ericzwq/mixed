// import {combineReducers} from 'redux'
import {combineReducers} from "../MyRedux";
import userInfo from './login_reducer'

export default combineReducers({
  userInfo, count: (state = 3, action) => {
    // console.error('count', {state, action})
    let {type, data} = action
    switch (type) {
      default:
        return state
    }
  }
})
