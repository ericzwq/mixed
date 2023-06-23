import { createStoreBindings } from "mobx-miniprogram-bindings"
import { stagingStore, userStore } from "../../store/store"

Component({
  properties: {
    data: Array
  },
  data: {
    title: '',
    contents: [] as SgMsg[] | GpMsg[],
    storeBindings: {} as StoreBindings,
  },
  methods: {

  },
  lifetimes: {
    attached() {
      this.data.storeBindings = createStoreBindings(this, {
        store: userStore,
        fields: ['unameUserMap']
      })
      const { data } = this.properties
      const memberSet = new Set<Users.Username>()
      data.some((selected: SgMsg | GpMsg) => memberSet.add(selected.from!).size === 2)
      const { chatLog } = stagingStore
      chatLog.computeChatLogTitle(Array.from(memberSet)).then(title => {
        this.setData({ title, contents: data })
      })
    },
    moved() {
      this.data.storeBindings.destroyStoreBindings()
    }
  }
})