import React from "react";

let store, subscribeList = [], mainState = {}, reducerMap = {}, reducerKeys = [], updateList = []

function update() {
  updateList.forEach(f => f())
  subscribeList.forEach(subscribe => subscribe())
}

export const connect = function (mapStateToProps, mapDispatchToProps) { // connect({}, {})(Component)
  let state = {}, dispatch = {}, changed,
    updateState = () => {
      let newState = mapStateToProps(mainState)
      changed = !isShallowEqual(state, newState)
      if (changed) state = newState
      return changed
    }
  return UIComponent => (class Container extends React.Component {
    state = {
      updateTimes: 0
    }

    UNSAFE_componentWillMount() {
      updateState()
      for (let k in mapDispatchToProps) {
        dispatch[k] = data => store.dispatch(mapDispatchToProps[k](data))
      }
    }

    UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
      // console.error('connect will update', UIComponent.name, arguments)
    }

    updateKey = () => {
      if (updateState()) this.setState({updateTimes: this.state.updateTimes + 1})
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
      return changed
    }

    componentDidMount() {
      updateList.push(this.updateKey)
    }

    render() {
      return <UIComponent {...state} {...dispatch} {...this.props}/>
    }
  })
}

export const subscribe = sub => subscribeList.push(sub)
export const createStore = function (reducer) { // function (state = initState, action)
  mainState = reducer(undefined, {type: '@@action_'}) // 没有使用combineReducers
  console.log({mainState})
  return {
    dispatch(action) { // {type: SAVE_LOGIN, data}
      let res = reducerKeys.find(k => {
        let preState = mainState[k],
          newState = reducerMap[k](preState, action),
          changed = !isShallowEqual(preState, newState)
        if (changed) mainState[k] = newState
        return changed
      })
      if (!res) return false
      update()
      return true
    },
    getState() {
      return mainState
    }
    // replaceReducer
    // subscribe
  }
}
// {userInfo: 1}
export const combineReducers = function (reducers) {
  return function (state, action) {
    for (let k in reducers) {
      let reducer = reducers[k]
      mainState[k] = reducer(state, action)
      reducerMap[k] = reducer
      reducerKeys.push(k)
    }
    // reducerKeys = Object.keys(mainState)
    return mainState
  }
}

export class Provider extends React.Component {
  render() {
    let {store: _store, children: App} = this.props
    store = _store
    return <div>{App}</div>
  }
}

function isShallowEqual(obj1, obj2) {
  let type1 = type(obj1), type2 = type(obj2)
  if (type1 !== type2) return false
  if (['Object', 'Array'].includes(type1)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) return false
    for (let k in obj1) {
      if (!obj2.hasOwnProperty(k)) return false
      if (['Object', 'Array'].includes(type(obj1[k]))) {
        return isShallowEqual(obj1[k], obj2[k])
      } else {
        return obj1[k] === obj2[k]
      }
    }
    return true
  } else {
    return obj1 === obj2
  }
}

function type(v) {
  return Object.prototype.toString.call(v).slice(8, -1)
}
