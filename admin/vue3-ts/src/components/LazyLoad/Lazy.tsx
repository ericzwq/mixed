import {defineComponent, onMounted} from "vue";

export default defineComponent({
  render() {
    console.log(this)
    // return h('div') // this.$slots.default
    return (<div>

    </div>)
  },
  setup() {
    onMounted(() => {
      console.log('mounted')
    })
  }
})
