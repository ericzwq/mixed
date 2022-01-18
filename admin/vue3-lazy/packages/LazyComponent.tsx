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
      return this.$slots.loading ? h('div', this.$slots.loading()) : <div/>
    } else {
      return this.$slots.default ? h('div', this.$slots.default()) : <div/>
    }
  },
  props: ['lazyKey'],
  setup() {
    data.componentTotal++
    onBeforeUnmount(() => {
      for (const [, vmSet] of lazyVmMap) {
        if (vmSet.delete(getCurrentInstance()?.proxy as ComponentPublicInstance)) {
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
