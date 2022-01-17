import Lazy, { config } from "./Lazy";
export default {
    install(app, options) {
        Object.assign(config, options);
        app.component('lazy-component', Lazy);
        // app.directive('lazy', {
        //   beforeMount() {
        //     console.log('before mount', arguments)
        //   },
        //   mounted() {
        //     console.log('mounted', arguments)
        //   },
        //   updated() {
        //     console.log('updated', arguments)
        //   },
        //   beforeUnmount() {
        //     console.log('before unmount', arguments)
        //   }
        // })
    }
};
//# sourceMappingURL=index.js.map