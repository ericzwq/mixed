import {
  ComponentPublicInstance,
  defineComponent,
  getCurrentInstance, h,
  nextTick,
  onBeforeUnmount,
  ref, watch
} from "vue";
import {ExtComponentPublicInstance, LazyProps} from "./types";

const parentElSet = new Set(), lazyVmMap = new Map<string, Set<ComponentPublicInstance>>()
let total = 0
export const listener = throttle((targetVmSet,
                                  top, right,
                                  bottom, left,
                                  y, x): void => {
  // console.log({targetVmSet, top, right, bottom, left, y, x})
  lazyHandler(targetVmSet, top !== undefined ?
    (el) => inView(el, top, right as number, bottom as number, left as number, y as number, x as number) : inViewPort)
  // console.log(lazyVmMap)
})
window.addEventListener('scroll', listener)

// 是否在浏览器视口内
function inViewPort(el: HTMLElement) {
  const {left, right, top, bottom} = el.getBoundingClientRect()
  return top <= window.innerHeight && bottom > 0 && left <= window.innerWidth && right > 0
}

// 是否在父元素视口内
function inView(el: HTMLElement, pTop: number, pRight: number, pBottom: number, pLeft: number, y: number, x: number) {
  const {left, right, top, bottom} = el.getBoundingClientRect()
  // console.log({left, right, top, bottom}, el.classList)
  return top <= pBottom + y && bottom >= pTop - y
    && left <= pRight + x && right >= pLeft - x
}

// 无序，全部检查
function lazyHandler(targetVmSet: Set<ComponentPublicInstance>, checkFn: (el: HTMLElement) => boolean): void {
  for (const vm of targetVmSet) {
    if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
      targetVmSet.delete(vm)
      total--
      continue
    }
    if (checkFn(vm.$el)) {
      (vm as ExtComponentPublicInstance).loaded = true
      targetVmSet.delete(vm)
      total--
    }
  }
}

function addRecords(vm: ComponentPublicInstance) {
  const lazyVmSet = lazyVmMap.get((vm.$props as LazyProps).lazyKey ?? 'default') || new Set()
  if (lazyVmSet.has(vm)) return
  let el: HTMLElement = vm.$el
  lazyVmSet.add(vm)
  lazyVmMap.set((vm.$props as LazyProps).lazyKey ?? 'default', lazyVmSet)
  el = el.parentElement as HTMLElement
  while (el) {
    if (parentElSet.has(el)) break
    parentElSet.add(el)
    el.addEventListener('scroll', listener)
    el = el.parentElement as HTMLElement
  }
  let count = 0
  for (const [, lazyEls] of lazyVmMap) count += lazyEls.size
  if (count === total) listener()
}


export default defineComponent({
  render() {
    if (!this.loaded) {
      nextTick().then(() => addRecords(this))
      return this.$slots.loading ? h('div', this.$slots.loading()) : <div {...this.$attrs}/>
    } else {
      return this.$slots.default ? h('div', this.$slots.default()) : <div {...this.$attrs}/>
    }
  },
  props: ['lazyKey'],
  setup() {
    total++
    onBeforeUnmount(() => {
      for (const [, set] of lazyVmMap) {
        if (set.delete(getCurrentInstance()?.proxy as ComponentPublicInstance)) total--
      }
    })
    const loaded = ref(false)
    watch(loaded, () => 1)
    return {
      loaded
    }
  }
})

export const config = {
  preLoad: 0.3,
  timeout: 200
}

function throttle(cb: (set: Set<ComponentPublicInstance>, top?: number, right?: number, bottom?: number,
                       left?: number, y?: number, x?: number) => void) {
  let flag = false, lastScrollLeft = 0, lastScrollTop = 0, timer: number
  const handler = (event?: Event) => {
    if (event && ![window, document].includes(event.target as Document)) {
      const targetElSet: Set<ComponentPublicInstance> = findElSet(event.target as HTMLElement) || new Set()
      const {left, right, top, bottom} = ((event.target as HTMLElement).getBoundingClientRect())
      const {scrollLeft, scrollTop} = (event.target as HTMLElement)
      cb(targetElSet, top, right, bottom, left, Math.abs(scrollTop - lastScrollTop) * config.preLoad, Math.abs(scrollLeft - lastScrollLeft) * config.preLoad) // 大于0向上滚动
      lastScrollLeft = scrollLeft
      lastScrollTop = scrollTop
    } else {
      for (const [, set] of lazyVmMap) cb(set)
    }
    flag = false
  }
  return (event?: Event) => {
    clearTimeout(timer)
    timer = setTimeout(() => handler(event), config.timeout + 50) // 防抖
    if (flag) return
    flag = true
    setTimeout(() => handler(event), config.timeout) // 节流
  }
}

// 获取target所在懒加载元素中的set
function findElSet(target: HTMLElement): Set<ComponentPublicInstance> | null {
  for (const [, lazyVmSet] of lazyVmMap) {
    if (!lazyVmSet.size) continue
    let el
    for (const vm of lazyVmSet) {
      if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
        total--
        lazyVmSet.delete(vm)
      } else {
        el = vm.$el
        break
      }
    }
    if (!el) return null
    if (el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINS) return lazyVmSet
  }
  return null
}
