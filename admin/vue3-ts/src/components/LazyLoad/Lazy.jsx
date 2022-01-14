import { defineComponent, nextTick, onUpdated } from "vue";
const records = new Map(), set = new Set();
function addRecords(el) {
    if (set.has(el))
        return;
    set.add(el);
    let parent = el.parentElement;
    if (parent) {
        const els = records.get(parent) || [];
        els.push(el);
        records.set(parent, els);
        while (parent) {
            parent = parent.parentElement;
        }
    }
}
export default defineComponent({
    render() {
        // return h('div') // this.$slots.default
        return (<div ref={(el) => nextTick(() => addRecords(el))}>

    </div>);
    },
    setup(props, options) {
        onUpdated(() => {
            console.log('updated');
        });
    }
});
//# sourceMappingURL=Lazy.jsx.map