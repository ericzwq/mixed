import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		contacts: [],
		contactMap: new Map(),
		user: {}
	},
	mutations: {
		setContacts(state, payload) {
			state.contacts = payload
			const contactMap = new Map()
			payload.forEach(v => contactMap.set(v.username, v))
			state.contactMap = contactMap
			uni.setStorageSync('contacts', JSON.stringify(payload))
		},
		setUser(state, payload) {
			state.user = payload
			uni.setStorageSync('user', JSON.stringify(payload))
		}
	}
})
export default store
