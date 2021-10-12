import ReactDom from 'react-dom'
import App from './App'
// import {createStore} from 'redux'
import {createStore, Provider, subscribe} from "./MyRedux";
// import {Provider} from 'react-redux'
import reducer from './reducers'
const store = createStore(reducer)
// console.log({store, reducer}, store.getState())
ReactDom.render(<Provider store={store}><App/></Provider>, document.getElementById('root'))

// subscribe(() => ReactDom.render(<Provider store={store}><App/></Provider>, document.getElementById('root')))
