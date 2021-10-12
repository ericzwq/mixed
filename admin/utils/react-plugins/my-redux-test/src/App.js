import React from "react";
import Login from "./containers/Login";
// import {connect} from "react-redux";
import {connect} from "./MyRedux";
import {createLoginAction} from "./action_creators";

class App extends React.Component {
  componentDidMount() {
    // this.props.saveLogin({username: 'lisi'})
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    console.error('app update', arguments)
  }
  state = {
    a: 3
  }
  render() {
    console.log('app render------', this)
    return (
      <div>
        app
        <button onClick={() => this.props.saveLogin({username: 'lisi'})}>按钮</button>
        <h3>app--username:{this.props.userInfo.username}</h3>
        <Login a={this.state.a}/>
      </div>
    )
  }
}

export default connect(state => ({userInfo: state.userInfo}), {saveLogin: createLoginAction})(App)
