import { defineComponent, getCurrentInstance, h, nextTick, onBeforeUnmount, ref, watch } from "vue";
const parentElSet = new Set(), lazyVmMap = new Map();
let total = 0;
export const listener = throttle((targetVmSet, top, right, bottom, left, y, x) => {
    // console.log({targetVmSet, top, right, bottom, left, y, x})
    lazyHandler(targetVmSet, top !== undefined ?
        (el) => inView(el, top, right, bottom, left, y, x) : inViewPort);
    // console.log(lazyVmMap)
});
window.addEventListener('scroll', listener);
// 是否在浏览器视口内
function inViewPort(el) {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    return top <= window.innerHeight && bottom > 0 && left <= window.innerWidth && right > 0;
}
// 是否在父元素视口内
function inView(el, pTop, pRight, pBottom, pLeft, y, x) {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    // console.log({left, right, top, bottom}, el.classList)
    return top <= pBottom + y && bottom >= pTop - y
        && left <= pRight + x && right >= pLeft - x;
}
// 无序，全部检查
function lazyHandler(targetVmSet, checkFn) {
    for (const vm of targetVmSet) {
        if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
            targetVmSet.delete(vm);
            total--;
            continue;
        }
        if (checkFn(vm.$el)) {
            vm.loaded = true;
            targetVmSet.delete(vm);
            total--;
        }
    }
}
function addRecords(vm) {
    const lazyVmSet = lazyVmMap.get(vm.$props.lazyKey ?? 'default') || new Set();
    if (lazyVmSet.has(vm))
        return;
    let el = vm.$el;
    lazyVmSet.add(vm);
    lazyVmMap.set(vm.$props.lazyKey ?? 'default', lazyVmSet);
    el = el.parentElement;
    while (el) {
        if (parentElSet.has(el))
            break;
        parentElSet.add(el);
        el.addEventListener('scroll', listener);
        el = el.parentElement;
    }
    let count = 0;
    for (const [, lazyEls] of lazyVmMap)
        count += lazyEls.size;
    if (count === total)
        listener();
}
export default defineComponent({
    render() {
        if (!this.loaded) {
            nextTick().then(() => addRecords(this));
            return this.$slots.loading ? h('div', this.$slots.loading()) : <div {...this.$attrs}/>;
        }
        else {
            return this.$slots.default ? h('div', this.$slots.default()) : <div {...this.$attrs}/>;
        }
    },
    props: ['lazyKey'],
    setup() {
        total++;
        onBeforeUnmount(() => {
            for (const [, set] of lazyVmMap) {
                if (set.delete(getCurrentInstance()?.proxy))
                    total--;
            }
        });
        const loaded = ref(false);
        watch(loaded, () => 1);
        return {
            loaded
        };
    }
});
export const config = {
    preLoad: 0.3,
    timeout: 200
};
function throttle(cb) {
    let flag = false, lastScrollLeft = 0, lastScrollTop = 0, timer;
    const handler = (event) => {
        if (event && ![window, document].includes(event.target)) {
            const targetElSet = findElSet(event.target) || new Set();
            const { left, right, top, bottom } = (event.target.getBoundingClientRect());
            const { scrollLeft, scrollTop } = event.target;
            cb(targetElSet, top, right, bottom, left, Math.abs(scrollTop - lastScrollTop) * config.preLoad, Math.abs(scrollLeft - lastScrollLeft) * config.preLoad); // 大于0向上滚动
            lastScrollLeft = scrollLeft;
            lastScrollTop = scrollTop;
        }
        else {
            for (const [, set] of lazyVmMap)
                cb(set);
        }
        flag = false;
    };
    return (event) => {
        clearTimeout(timer);
        timer = setTimeout(() => handler(event), config.timeout + 50); // 防抖
        if (flag)
            return;
        flag = true;
        setTimeout(() => handler(event), config.timeout); // 节流
    };
}
// 获取target所在懒加载元素中的set
function findElSet(target) {
    for (const [, lazyVmSet] of lazyVmMap) {
        if (!lazyVmSet.size)
            continue;
        let el;
        for (const vm of lazyVmSet) {
            if (vm.$el.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) { // 元素被移除
                total--;
                lazyVmSet.delete(vm);
            }
            else {
                el = vm.$el;
                break;
            }
        }
        if (!el)
            return null;
        if (el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINS)
            return lazyVmSet;
    }
    return null;
}
//# sourceMappingURL=Lazy.jsx.map