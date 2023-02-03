<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import {io} from 'socket.io-client'
export default {
  name: 'App',
  components: {
    HelloWorld
  },
	mounted() {
		console.log(window.io)
		const socket = io('ws://localhost:5000/a')
		console.log(socket)
		socket.onopen = function() {
			console.log('Connection open ...');
			socket.send('Hello WebSockets!');
		};
		socket.onmessage = function(evt) {
			console.log('Received Message: ' + evt.data);
			socket.close();
		};
		
		socket.onclose = function() {
			console.log('Connection closed.');
		};
	}
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
