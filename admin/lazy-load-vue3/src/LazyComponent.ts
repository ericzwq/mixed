import {
  ComponentPublicInstance,
  defineComponent,
  getCurrentInstance, h,
  nextTick,
  onBeforeUnmount,
  ref
} from "vue";
import {addComponentRecords, data, lazyVmMap} from "./listen";

export default defineComponent({
  render() {
    if (!this.loaded) {
      nextTick().then(() => addComponentRecords(this))
      return this.$slots.loading ? h('div', this.$slots.loading()) : h('div')
    } else {
      return this.$slots.default ? h('div', this.$slots.default()) : h('div')
    }
  },
  props: ['lazyKey'],
  setup() {
    data.componentTotal++
    onBeforeUnmount(() => {
      for (const [, vmSet] of lazyVmMap) {
        const vm = getCurrentInstance() as any
        if (vm && vmSet.delete(vm)) {
          data.componentTotal--
          data.componentCount--
        }
      }
    })
    const loaded = ref(false)
    return {
      loaded
    }
  }
})
