import {ComponentPublicInstance} from "vue";
import {BaseConfig, ExtComponentPublicInstance, ExtHTMLElement, Config, DirectiveConfig, Status} from "./types";

export const parentElSet = new Set()
export const lazyVmMap = new Map<string, Set<ComponentPublicInstance>>()
export const lazyElMap = new Map<string, Set<ExtHTMLElement>>()
export const data = {
  componentTotal: 0,
  directiveTotal: 0,
  componentCount: 0,
  directiveCount: 0
}
const baseConfig: BaseConfig = {
  error: '',
  loading: '',
  errorClassList: [],
  loadingClassList: []
}
export const config: Config = Object.assign(baseConfig, {
  timeout: 200,
  preLoad: 0.3,
  component: false
})
export const directiveConfig: DirectiveConfig = Object.assign(baseConfig, {
  src: '',
  lazyKey: 'default',
  loaded: false
})
export const listener = throttle((targetVmSet, targetElSet, top, right, bottom, left, y, x): void => {
  lazyHandler(targetVmSet, targetElSet, top !== undefined ? (el) => inParentView(el, top, right as number, bottom as number, left as number, y as number, x as number) : inViewPort)
})

window.addEventListener('scroll', listener)

export function inViewPort(el: HTMLElement): boolean {
  const {left, right, top, bottom} = el.getBoundingClientRect()
  return top <= window.innerHeight && bottom > 0 && left <= window.innerWidth && right > 0
}

function inParentView(el: HTMLElement, pTop: number, pRight: number, pBottom: number, pLeft: number, y: number, x: number): boolean {
  const {left, right, top, bottom} = el.getBoundingClientRect()
  return top <= pBottom + y && bottom >= pTop - y && left <= pRight + x && right >= pLeft - x
}

function lazyHandler(targetVmSet: Set<ComponentPublicInstance>, targetElSet: Set<ExtHTMLElement>, checkFn: (el: HTMLElement) => boolean): void {
  // components
  for (const vm of targetVmSet) {
    if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // unmount
      targetVmSet.delete(vm)
      data.componentTotal--
      data.componentCount--
      continue
    }
    if (checkFn(vm.$el)) {
      (vm as ExtComponentPublicInstance).loaded = true
      targetVmSet.delete(vm)
      data.componentTotal--
      data.componentCount--
    }
  }
  // directives
  for (const el of targetElSet) {
    if (el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) {
      targetElSet.delete(el)
      data.directiveTotal--
      data.directiveCount--
      continue
    }
    if (checkFn(el)) {
      updateDirectiveEl(el, targetElSet)
    }
  }
}

export function updateDirectiveEl(el: ExtHTMLElement, targetElSet?: Set<ExtHTMLElement>): void {
  const {src, loadingClassList, errorClassList, error} = el.lazy as DirectiveConfig
  el.setAttribute('src', src)
  el.classList.remove(...loadingClassList)
  el.addEventListener('error', () => {
    el.classList.add(...errorClassList)
    el.setAttribute('status', Status.error)
    if (error) el.setAttribute('src', error)
  })
  el.lazy = undefined
  el.setAttribute('status', Status.loaded)
  if (targetElSet) {
    targetElSet.delete(el)
    data.directiveTotal--
    data.directiveCount--
  } else {
    for (const [, elSet] of lazyElMap) {
      if (elSet.delete(el)) {
        data.directiveTotal--
        data.directiveCount--
      }
    }
  }
}

export function addComponentRecords(vm: ComponentPublicInstance): void {
  const lazyVmSet = lazyVmMap.get((vm.$props as { lazyKey: string }).lazyKey ?? 'default') || new Set()
  if (lazyVmSet.has(vm)) return
  lazyVmSet.add(vm)
  lazyVmMap.set((vm.$props as { lazyKey: string }).lazyKey ?? 'default', lazyVmSet)
  let parent = vm.$el.parentElement as HTMLElement
  while (parent) {
    if (parentElSet.has(parent)) break
    parentElSet.add(parent)
    parent.addEventListener('scroll', listener)
    parent = parent.parentElement as HTMLElement
  }
  if (++data.componentCount === data.componentTotal && data.directiveCount === data.directiveTotal) listener()
}

export function addDirectiveRecords(el: ExtHTMLElement, key: string): void {
  const lazyVmSet = lazyElMap.get(key) || new Set()
  if (lazyVmSet.has(el)) return
  el.setAttribute('status', Status.loading)
  lazyVmSet.add(el)
  lazyElMap.set(key, lazyVmSet)
  let parent = el.parentElement as HTMLElement
  while (parent) {
    if (parentElSet.has(parent)) break
    parentElSet.add(parent)
    parent.addEventListener('scroll', listener)
    parent = parent.parentElement as HTMLElement
  }
  if (++data.directiveCount === data.directiveTotal && data.componentCount === data.componentTotal) listener()
}

function throttle(cb: (targetVmSet: Set<ComponentPublicInstance>, targetElSet: Set<ExtHTMLElement>, top?: number, right?: number, bottom?: number, left?: number, y?: number, x?: number) => void) {
  let flag = false, lastScrollLeft = 0, lastScrollTop = 0, timer: number
  const handler = (event?: Event) => {
    if (event && ![window, document].includes(event.target as Document)) {
      const targetVmSet: Set<ComponentPublicInstance> = findVmSet(event.target as HTMLElement)
      const targetElSet: Set<ExtHTMLElement> = findElSet(event.target as HTMLElement)
      const {left, right, top, bottom} = ((event.target as HTMLElement).getBoundingClientRect())
      const {scrollLeft, scrollTop} = (event.target as HTMLElement)
      cb(targetVmSet, targetElSet, top, right, bottom, left, Math.abs(scrollTop - lastScrollTop) * config.preLoad, Math.abs(scrollLeft - lastScrollLeft) * config.preLoad) // 大于0向上滚动
      lastScrollLeft = scrollLeft
      lastScrollTop = scrollTop
    } else {
      for (const [, vmSet] of lazyVmMap) cb(vmSet, new Set())
      for (const [, elSet] of lazyElMap) cb(new Set(), elSet)
    }
    flag = false
  }
  return (event?: Event) => {
    clearTimeout(timer)
    timer = setTimeout(() => handler(event), config.timeout + 50) // debounce
    if (flag) return
    flag = true
    setTimeout(() => handler(event), config.timeout) // throttle
  }
}

function findVmSet(target: HTMLElement): Set<ComponentPublicInstance> {
  for (const [, lazyVmSet] of lazyVmMap) {
    if (!lazyVmSet.size) continue
    // let el
    for (const vm of lazyVmSet) {
      if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
        data.componentTotal--
        data.componentCount--
        lazyVmSet.delete(vm)
      } else {
        // el = vm.$el
        if (vm.$el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINS) return lazyVmSet
        break
      }
    }
    // if (!el) return new Set()
    // if (el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINS) return lazyVmSet
  }
  return new Set()
}

function findElSet(target: HTMLElement): Set<ExtHTMLElement> {
  for (const [, lazyElSet] of lazyElMap) {
    if (!lazyElSet.size) continue
    for (const el of lazyElSet) {
      if (el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
        data.directiveTotal--
        data.directiveCount--
        lazyElSet.delete(el)
      } else {
        if (el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINS) return lazyElSet
        break
      }
    }
  }
  return new Set()
}
