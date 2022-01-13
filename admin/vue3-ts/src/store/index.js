import { createStore } from 'vuex';
import user from './modules/user';
export default createStore({
    modules: {
        user: {
            namespaced: true,
            ...user
        }
    }
});
//# sourceMappingURL=index.js.map