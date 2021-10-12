/**
 * 使用示例：
 *   全局注册
 Vue.use(Lazy, {
       target = window, 监听的元素
       maxLoadDistance = 0.3, 处于2次触发滚动的差值的倍数范围内时渲染（）
       listenType = 'scroll', 监听事件类型
       componentSorted = true, 组件是否已排序
       directiveSorted = true, 指令是否已排序
       loadingPicSrc, 加载时的图片地址
       loadingPicClassList, 加载时的类名（加载完成或失败后移除）
       errorPicSrc, 加载失败的图片地址
       loadingComponent, 加载时的组件（仅适用于组件模式）
       timeout = 500 监听截流间隔
 *   })
 * 指令：(与全局重名的配置意为覆盖全局配置), PicObject（引入的图片对象）
 *   v-lazy:[option]="[options]"
 *      option: String
 *           update：组件更新时展示图片（如：tooltip）
 *           【默认】：组件存在页面中才监听滚动触发（如：display不为none）
 *           force：强制指定监听（如display为none）
 *      options: Object | String
 *            String: 指定要加载的src
 *            Object: {
 *              loadingPicSrc: String | PicObject：加载时的图片地址
 *              loadingPicClassList: Array<String>：加载时的类名（加载完成或失败后移除）
 *              errorPicSrc: String | PicObject：加载失败的图片地址
 *              src: String | PicObject：要加载的图片地址
 *            }
 * 组件：
 *    <Lazy><some-component/></Lazy>
 * 默认导出：
 *    class Lazy
 * 分别导出：
 *    listener()：
 *      手动触发一次监听（页面改变时可能需要）
 *    sortComponentElementList()：
 *      组件挂载顺序是否根据元素距离窗口顶部位置从小到大，即表格第一行的组件最先挂载到页面，第二行的组件第二顺序挂载到页面（正常同一表格内渲染后是已排序的，若无序可在所有元素渲染后调用此排序，提高监听时的效率，若元素有序，当滚动触发时某元素不符合渲染条件则不会再判断该元素后面的元素）
 *    sortDirectiveElementList()：
 *      如同组件使用方式，区别是监听的列表和组件方式是分开的，所以需要单独排序（如注册监听时元素无序）
 *    setLazyListenerTarget(target, removeOldTarget = true, type = 'scroll')：
 *      target：要监听的元素， removeOldTarget：是否移除之前添加的监听， type：监听的事件类型
 *    removeLazyListener(target, type = 'scroll')：
 *      target：要移除监听的元素， type： 要移除的监听事件类型
 *    sortComponentElementList()
 *    sortDirectiveElementList()
 */
let _target, listenComponentList = [], listenDirectiveList = [], listenComponentMap = {},
  listenDirectiveMap = {}, winHeight = window.innerHeight, unListenComponentCount = 0, unListenDirectiveCount = 0,
  _componentSorted,
  _directiveSorted,
  commonLoadingPicClassList,
  commonLoadingPicSrc,
  commonErrorPicSrc,
  hasListener,
  _timeout = 500,
  isDef = v => v !== undefined

function handleDirectiveLoading(el, value) { // 处理加载时的数据
  el['data-value'] = value
  if (typeof value === 'object') {
    let {loadingPicSrc, loadingPicClassList} = value // commonLoadingPicSrc全局配置， loadingPicSrc单独配置， 单独配置优先级高于全局配置
    el.src = isDef(loadingPicSrc) ? loadingPicSrc : isDef(commonLoadingPicSrc) ? commonLoadingPicSrc : ''
    if (!isDef(loadingPicClassList)) loadingPicClassList = commonLoadingPicClassList
    loadingPicClassList?.forEach(i => el.classList.add(i))
  } else {
    if (isDef(commonLoadingPicSrc)) el.src = commonLoadingPicSrc
    commonLoadingPicClassList?.forEach(i => el.classList.add(i))
  }
}

function handleDirectiveLoaded(el) { // 处理加载完成的数据
  let value = el['data-value'], _errorPicSrc = commonErrorPicSrc, _loadingPicClassList = commonLoadingPicClassList
  if (typeof value === 'object') {
    let {loadingPicClassList, errorPicSrc, src} = value // commonLoadingPicClassList全局配置， loadingPicClassList单独配置， 单独配置优先级高于全局配置
    el.src = src
    if (isDef(loadingPicClassList)) _loadingPicClassList = loadingPicClassList
    if (isDef(errorPicSrc)) _errorPicSrc = errorPicSrc
  } else {
    el.src = value
  }
  addImgListener(el, _errorPicSrc, _loadingPicClassList)
}

function addImgListener(el, errorPicSrc, loadingPicClassList) { // 添加图片加载监听事件
  el.onerror = () => {
    if (errorPicSrc) el.src = errorPicSrc
    loadingPicClassList?.forEach(i => el.classList.remove(i))
  }
  el.onload = () => {
    loadingPicClassList?.forEach(i => el.classList.remove(i))
  }
}

export let listener
export const sortComponentElementList = () => { // 对组件模式元素排序
  listenComponentList.sort((a, b) => a.$el.getBoundingClientRect().top - b.$el.getBoundingClientRect().top)
  return _componentSorted = !!listenComponentList.length // 里面有元素时才表示成功排序
}
export const sortDirectiveElementList = () => { // 对指令模式元素排序
  listenDirectiveList.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
  return _directiveSorted = !!listenDirectiveList.length
}
export const setLazyListenerTarget = (target, removeOldTarget = true, type = 'scroll') => {
  Lazy.addListener(type, target, removeOldTarget ? _target : null)
  _target = target
}
export const removeLazyListener = (target, type = 'scroll') => target.removeEventListener(target, type)
export default class Lazy {
  static addListener(type, target = _target, removeListenerTarget) { // 给新元素添加监听，移除旧元素监听
    console.log('addListener', {type, target, removeListenerTarget})
    removeListenerTarget && removeListenerTarget.removeEventListener(type, listener)
    target.addEventListener(type, listener)
    hasListener = true
    listener()
  }

  static install(Vue, {
    target = window,
    maxLoadDistance = 0.3,
    listenType = 'scroll',
    componentSorted = true,
    directiveSorted = true,
    loadingPicSrc,
    loadingPicClassList,
    errorPicSrc,
    loadingComponent,
    timeout = 500
  } = {}) {
    _target = target // 监听的元素
    _componentSorted = componentSorted // 组件是否已排序
    _directiveSorted = directiveSorted // 指令是否已排序
    commonLoadingPicClassList = loadingPicClassList
    commonLoadingPicSrc = loadingPicSrc
    commonErrorPicSrc = errorPicSrc
    _timeout = timeout
    listener = throttle(y => { // 调用此方法可手动触发监听处理
      console.log('触发监听')
      let distance = y * maxLoadDistance
      listenComponentList.every((vue, index) => {
        let el = vue.$el
        let {top, right} = el.getBoundingClientRect()
        if (right && top - winHeight < distance) {
          vue.__lazyed = true
          delete listenComponentList[index]
          unListenComponentCount++
          vue.key++
          return true
        } else {
          console.log('停止观察后面的元素', index)
          return !_componentSorted // 如果已排序则返回false停止后续元素的监听
        }
      })
      listenDirectiveList.every((el, index) => {
        let {top, right} = el.getBoundingClientRect()
        if (right && top - winHeight < distance) {
          handleDirectiveLoaded(el)
          el.__lazyed = true
          delete listenDirectiveList[index]
          unListenDirectiveCount++
          return true
        } else {
          console.log('停止观察后面的元素2', index)
          return !_directiveSorted // 如果已排序则返回false停止后续元素的监听
        }
      })
      console.log(unListenComponentCount, listenComponentList.length, unListenDirectiveCount, listenDirectiveList.length)
      let flag
      if (unListenComponentCount >= listenComponentList.length) {
        // console.log('移除监听')
        listenComponentList = []
        listenComponentMap = {}
        unListenComponentCount = 0
        flag = true
        // _target.removeEventListener('scroll', listener)
      }
      if (unListenDirectiveCount >= listenDirectiveList.length && flag) {
        console.log('移除监听')
        listenDirectiveList = []
        listenDirectiveMap = {}
        unListenDirectiveCount = 0
        _target.removeEventListener('scroll', listener)
        hasListener = false
      }
    }, _timeout)
    Vue.directive('Lazy', {
      inserted(el, {arg, value}) { // 默认元素存在且展示则监听, force-->强制指定监听该元素, update-->强制指定只在组件更新时触发图片加载
        // console.log({arg, value})
        if (arg === 'update') {
          return handleDirectiveLoading(el, value)
        } else if (arg === 'force') {
          return add()
        }
        let {right} = el.getBoundingClientRect()
        if (right) add()

        function add() {
          // el['data-value'] = value
          let id = Math.random().toString(36)
          el['data-id'] = id
          handleDirectiveLoading(el, value)
          let len = listenDirectiveList.push(el)
          listenDirectiveMap[id] = len - 1
          Vue.nextTick(() => {
            if (!hasListener) {
              Lazy.addListener(listenType)
            }
          })
        }
      },
      unbind(el) {
        let id = el['data-id']
        if (!id) return
        if (el.__lazyed) return // 有__lazyed说明已经记录过了
        unListenDirectiveCount++
        let index = listenDirectiveMap[id]
        delete listenDirectiveMap[id]
        delete listenDirectiveList[index]
      },
      componentUpdated(el, data) {
        let {right, top} = el.getBoundingClientRect(), winHeight = window.innerHeight
        if (!el['data-updated'] && right && top - winHeight < _target.clientHeight * maxLoadDistance) {
          let {value} = data, src
          if (typeof value === 'object') {
            let {loadingPicClassList, src: _src, errorPicSrc} = value
            src = _src
            loadingPicClassList = isDef(loadingPicClassList) ? loadingPicClassList : isDef(commonLoadingPicClassList) ? commonLoadingPicClassList : null
            errorPicSrc = isDef(errorPicSrc) ? errorPicSrc : isDef(commonErrorPicSrc) ? commonErrorPicSrc : null
          } else {
            src = value
          }
          el.src = src
          el['data-updated'] = true
          addImgListener(el, errorPicSrc, loadingPicClassList)
        }
      }
    })
    // Vue.prototype.$setLazyListenerTarget = (target, removeOldTarget = true, type = listenType) => {
    //   Lazy.addListener(type, target, removeOldTarget ? _target : null)
    //   _target = target
    // }
    // Vue.prototype.$removeLazyListener = (target, type = listenType) => target.removeEventListener(target, type)
    // Vue.prototype.$sortComponentElementList = sortComponentElementList
    // Vue.prototype.$sortDirectiveElementList = sortDirectiveElementList
    Lazy.addListener(listenType, _target)
    Vue.component('Lazy', {
      name: 'Lazy',
      props: ['index'],
      data() {
        return {
          key: 0,
          id: Math.random().toString(36)
        }
      },
      beforeDestroy() {
        if (this.__lazyed) return
        unListenComponentCount++
        let index = listenComponentMap[this.id]
        delete listenComponentMap[this.id]
        delete listenComponentList[index]
      },
      mounted() {
        let len = listenComponentList.push(this)
        listenComponentMap[this.id] = len - 1 // 当前id的索引
        this.$nextTick(() => {
          if (!hasListener) Lazy.addListener(listenType)
        })
      },
      render(createElement, hack) {
        if (this.__lazyed) { // 说明加载完成
          return <div>{this.$slots.default}</div>
        } else {
          if (loadingComponent) return createElement(loadingComponent, {props: {key: this.key}})
          return <div key={this.key}/>
        }
      }
    })
  }
}

function throttle(cb, timeout = 500) {
  let flag, lastScrollTop = 0
  return function () {
    if (flag) return
    flag = true
    setTimeout(() => {
      let top = _target.scrollTop, y = top - lastScrollTop
      lastScrollTop = top
      cb(y)
      flag = false
    }, timeout)
  }
}
