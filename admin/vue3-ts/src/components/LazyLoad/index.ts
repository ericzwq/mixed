import {App} from "vue";
import Lazy from "./Lazy";

export default {
  install(app: App) {
    app.component('lazy-component', Lazy)
  }
}
